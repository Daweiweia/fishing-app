const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// 获取帖子列表
router.get('/list', async (req, res) => {
  try {
    const { topic, page = 1, limit = 20 } = req.query;
    let sql = `SELECT p.*, u.nickname as author_name, u.avatar as author_avatar
               FROM posts p
               LEFT JOIN users u ON p.user_id = u.id
               WHERE 1=1`;
    let params = [];

    if (topic && topic !== 'all') {
      sql += ' AND p.topic = ?';
      params.push(topic);
    }

    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [rows] = await pool.query(sql, params);

    const posts = rows.map(row => ({
      ...row,
      images: row.images ? row.images.split(',') : []
    }));

    res.json({ code: 0, data: { list: posts, total: rows.length } });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 发布帖子
router.post('/publish', async (req, res) => {
  try {
    const { user_id, content, images, topic } = req.body;
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, content, images, topic) VALUES (?, ?, ?, ?)',
      [user_id, content, images, topic || 'all']
    );
    res.json({ code: 0, data: { id: result.insertId }, msg: '发布成功' });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 获取帖子详情（含评论列表）
router.get('/detail/:postId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [posts] = await pool.query(
      `SELECT p.*, u.nickname as author_name, u.avatar as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [req.params.postId]
    );

    if (!posts.length) return res.json({ code: -1, msg: '帖子不存在' });

    // 获取顶级评论
    const [comments] = await pool.query(
      `SELECT c.*, u.nickname as author_name, u.avatar as author_avatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? AND (c.parent_id IS NULL OR c.parent_id = 0)
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.params.postId, parseInt(limit), offset]
    );

    // 获取这些评论的所有子回复
    const commentIds = comments.map(c => c.id);
    let replies = [];
    if (commentIds.length > 0) {
      const [allReplies] = await pool.query(
        `SELECT c.*, u.nickname as author_name, u.avatar as author_avatar
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.parent_id IN (?) AND c.post_id = ?
         ORDER BY c.created_at ASC`,
        [commentIds, req.params.postId]
      );
      replies = allReplies;
    }

    // 合并回复到评论
    const commentsWithReplies = comments.map(c => ({
      ...c,
      replies: replies.filter(r => r.parent_id === c.id)
    }));

    res.json({ code: 0, data: { post: posts[0], comments: commentsWithReplies } });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 点赞/取消点赞帖子
router.post('/like/:post_id', async (req, res) => {
  try {
    const { user_id } = req.body;
    const postId = req.params.post_id;

    // 检查是否已点赞
    const [existing] = await pool.query(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, user_id]
    );

    if (existing.length > 0) {
      // 取消点赞
      await pool.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, user_id]);
      await pool.query('UPDATE posts SET likes = likes - 1 WHERE id = ? AND likes > 0', [postId]);
      return res.json({ code: 0, msg: '已取消点赞', liked: false });
    } else {
      // 点赞
      await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, user_id]);
      await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
      return res.json({ code: 0, msg: '点赞成功', liked: true });
    }
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 获取帖子点赞状态
router.get('/like/status/:post_id', async (req, res) => {
  try {
    const { user_id } = req.query;
    const [row] = await pool.query(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [req.params.post_id, user_id || 0]
    );
    res.json({ code: 0, data: { liked: row.length > 0 } });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 评论列表
router.get('/comments/:post_id', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [comments] = await pool.query(
      `SELECT c.*, u.nickname as author_name, u.avatar as author_avatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? AND (c.parent_id IS NULL OR c.parent_id = 0)
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.params.post_id, parseInt(limit), offset]
    );

    const commentIds = comments.map(c => c.id);
    let replies = [];
    if (commentIds.length > 0) {
      const [allReplies] = await pool.query(
        `SELECT c.*, u.nickname as author_name, u.avatar as author_avatar
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.parent_id IN (?)
         ORDER BY c.created_at ASC`,
        [commentIds]
      );
      replies = allReplies;
    }

    const commentsWithReplies = comments.map(c => ({
      ...c,
      replies: replies.filter(r => r.parent_id === c.id)
    }));

    res.json({ code: 0, data: commentsWithReplies });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 发表评论（含回复）
router.post('/comment', async (req, res) => {
  try {
    const { post_id, user_id, content, parent_id, reply_to_name } = req.body;
    if (!content || !content.trim()) {
      return res.json({ code: -1, msg: '内容不能为空' });
    }

    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content, parent_id, reply_to_name) VALUES (?, ?, ?, ?, ?)',
      [post_id, user_id || 0, content.trim(), parent_id || null, reply_to_name || null]
    );
    await pool.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?', [post_id]);
    res.json({ code: 0, data: { id: result.insertId }, msg: '评论成功' });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 点赞评论
router.post('/comment/like/:comment_id', async (req, res) => {
  try {
    const { user_id } = req.body;
    await pool.query('UPDATE comments SET likes = COALESCE(likes, 0) + 1 WHERE id = ?', [req.params.comment_id]);
    res.json({ code: 0, msg: '点赞成功' });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

module.exports = router;