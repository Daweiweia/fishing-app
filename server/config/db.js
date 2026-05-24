const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'fishing',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'fishing_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// 测试连接
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    conn.release();
    return true;
  } catch (err) {
    console.error('❌ 数据库连接失败:', err.message);
    return false;
  }
}

module.exports = { pool, testConnection };