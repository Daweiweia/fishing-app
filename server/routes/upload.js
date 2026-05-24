const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 jpg/png/gif/webp 图片'));
    }
  },
});

// 单图上传
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.json({ code: -1, msg: '未上传文件' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ code: 0, data: { url } });
});

// 多图上传
router.post('/images', upload.array('images', 9), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.json({ code: -1, msg: '未上传文件' });
  }
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ code: 0, data: { urls } });
});

module.exports = router;