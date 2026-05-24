const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// 获取钓点列表
router.get('/list', async (req, res) => {
  try {
    const { type, keyword, page = 1, limit = 20 } = req.query;
    let sql = 'SELECT * FROM spots WHERE 1=1';
    let params = [];

    if (type && type !== 'all') {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (keyword) {
      sql += ' AND (name LIKE ? OR address LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY rating DESC, checkin_count DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [rows] = await pool.query(sql, params);

    // 转换tags格式
    const spots = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));

    res.json({ code: 0, data: { list: spots, total: rows.length } });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 获取单个钓点详情
router.get('/detail/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM spots WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.json({ code: -1, msg: '钓点不存在' });
    }
    const spot = {
      ...rows[0],
      tags: rows[0].tags ? rows[0].tags.split(',') : []
    };
    res.json({ code: 0, data: spot });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 添加钓点
router.post('/add', async (req, res) => {
  try {
    const { name, latitude, longitude, address, type, tags, fish_types, bait, open_hours, price } = req.body;
    const [result] = await pool.query(
      `INSERT INTO spots (name, latitude, longitude, address, type, tags, fish_types, bait, open_hours, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, latitude, longitude, address, type, tags, fish_types, bait, open_hours, price]
    );
    res.json({ code: 0, data: { id: result.insertId }, msg: '添加成功' });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 获取钓点点评列表
router.get('/reviews/:spotId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const [rows] = await pool.query(
      `SELECT r.*, u.avatar as user_avatar 
       FROM spot_reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.spot_id = ? 
       ORDER BY r.created_at DESC 
       LIMIT ? OFFSET ?`,
      [req.params.spotId, parseInt(limit), offset]
    );
    
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM spot_reviews WHERE spot_id = ?', 
      [req.params.spotId]
    );
    
    res.json({ code: 0, data: { list: rows, total } });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 添加钓点点评
router.post('/review/add', async (req, res) => {
  try {
    const { spot_id, user_id, user_name, user_avatar, rating, content, fish_result } = req.body;
    if (!content || !content.trim()) {
      return res.json({ code: -1, msg: '请输入点评内容' });
    }
    if (!spot_id) {
      return res.json({ code: -1, msg: '钓点ID不能为空' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO spot_reviews (spot_id, user_id, user_name, user_avatar, rating, content, fish_result)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [spot_id, user_id || 0, user_name || '匿名用户', user_avatar || '', rating || 5, content.trim(), fish_result || '']
    );
    
    // 更新钓点评分
    const [[avg]] = await pool.query('SELECT AVG(rating) as avg FROM spot_reviews WHERE spot_id = ?', [spot_id]);
    const ratingVal = avg && avg.avg != null ? parseFloat(parseFloat(avg.avg).toFixed(1)) : 5;
    await pool.query('UPDATE spots SET rating = ? WHERE id = ?', [ratingVal, spot_id]);
    
    res.json({ code: 0, data: { id: result.insertId }, msg: '发布成功' });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 打卡钓点
router.post('/checkin', async (req, res) => {
  try {
    const { user_id, spot_id } = req.body;
    await pool.query('UPDATE spots SET checkin_count = checkin_count + 1 WHERE id = ?', [spot_id]);
    await pool.query('UPDATE users SET spot_count = spot_count + 1 WHERE id = ?', [user_id]);
    res.json({ code: 0, msg: '打卡成功' });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

module.exports = router;