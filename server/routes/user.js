const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// 获取/创建用户
router.post('/login', async (req, res) => {
  try {
    const { openid, nickname, avatar } = req.body;

    // 查找是否存在
    let [rows] = await pool.query('SELECT * FROM users WHERE openid = ?', [openid]);

    if (rows.length === 0) {
      // 创建新用户
      const [result] = await pool.query(
        'INSERT INTO users (openid, nickname, avatar) VALUES (?, ?, ?)',
        [openid, nickname || '钓鱼新手', avatar || '']
      );
      const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      return res.json({ code: 0, data: newUser[0] });
    }

    // 更新信息
    if (nickname || avatar) {
      await pool.query(
        'UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar) WHERE openid = ?',
        [nickname, avatar, openid]
      );
      const [updated] = await pool.query('SELECT * FROM users WHERE openid = ?', [openid]);
      return res.json({ code: 0, data: updated[0] });
    }

    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 获取用户信息
router.get('/info/:openid', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE openid = ?', [req.params.openid]);
    if (rows.length === 0) {
      return res.json({ code: -1, msg: '用户不存在' });
    }
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

// 更新用户信息
router.post('/update', async (req, res) => {
  try {
    const { openid, nickname, avatar, bio } = req.body;
    await pool.query(
      'UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), bio = COALESCE(?, bio) WHERE openid = ?',
      [nickname, avatar, bio, openid]
    );
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    res.json({ code: -1, msg: err.message });
  }
});

module.exports = router;