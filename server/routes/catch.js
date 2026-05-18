const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// 获取鱼获记录列表
router.get('/list', async (req, res) => {
  try {
    const { user_id, page = 1, limit = 20 } = req.query;
    let sql = `SELECT c.*, u.nickname as author_name 
               FROM catch_logs c 
               LEFT JOIN users u ON c.user_id = u.id
               WHERE 1=1`;
    let params = [];

    if (user_id) {
      sql += ' AND c.user_id = ?';
      params.push(user_id);
    }

    sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [rows] = await pool.query(sql, params);
    res.json({ code: 0, data: { list: rows, total: rows.length } });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 发布鱼获
router.post('/publish', async (req, res) => {
  try {
    const { user_id, fish_name, size, weight, spot_id, spot_name, image, description } = req.body;

    const [result] = await pool.query(
      `INSERT INTO catch_logs (user_id, fish_name, size, weight, spot_id, spot_name, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, fish_name, size, weight, spot_id, spot_name, image, description]
    );

    // 更新用户鱼获数
    await pool.query('UPDATE users SET catch_count = catch_count + 1 WHERE id = ?', [user_id]);

    res.json({ code: 0, data: { id: result.insertId }, msg: '发布成功' });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 获取用户鱼谱
router.get('/fishbook/:user_id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT fish_name, COUNT(*) as count, MAX(weight) as max_weight, MAX(size) as max_size
       FROM catch_logs WHERE user_id = ? GROUP BY fish_name ORDER BY count DESC`,
      [req.params.user_id]
    );
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

module.exports = router;