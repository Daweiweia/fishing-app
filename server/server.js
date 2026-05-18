require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
const spotsRouter = require('./routes/spots');
const catchRouter = require('./routes/catch');
const communityRouter = require('./routes/community');
const userRouter = require('./routes/user');
const weatherRouter = require('./routes/weather');

app.use('/api/spots', spotsRouter);
app.use('/api/catch', catchRouter);
app.use('/api/community', communityRouter);
app.use('/api/user', userRouter);
app.use('/api/weather', weatherRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`🎣 去哪钓服务已启动: http://localhost:${PORT}`);
  console.log(`📅 启动时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
});