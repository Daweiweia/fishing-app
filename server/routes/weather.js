const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// 城市经纬度配置
const cityCoords = {
  '杭州': { lat: 30.25, lon: 120.18 },
  '上海': { lat: 31.23, lon: 121.47 },
  '北京': { lat: 39.91, lon: 116.39 },
  '广州': { lat: 23.12, lon: 113.26 },
  '深圳': { lat: 22.54, lon: 114.06 },
  '成都': { lat: 30.67, lon: 104.07 },
  '武汉': { lat: 30.58, lon: 114.29 },
  '南京': { lat: 32.06, lon: 118.78 },
};

// 中国城市名 -> Open-Meteo 城市名映射
const cityNameMap = {
  '杭州': 'Hangzhou',
  '上海': 'Shanghai',
  '北京': 'Beijing',
  '广州': 'Guangzhou',
  '深圳': 'Shenzhen',
  '成都': 'Chengdu',
  '武汉': 'Wuhan',
  '南京': 'Nanjing',
};

// 获取真实天气数据
router.get('/current', async (req, res) => {
  try {
    const { city } = req.query;
    const cityKey = city || '杭州';
    const coords = cityCoords[cityKey];

    if (!coords) {
      return res.json({ code: -1, msg: '城市不支持' });
    }

    // 调用 Open-Meteo API 获取真实数据（免费，无需 key）
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code&timezone=Asia%2FShanghai`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.current) {
      throw new Error('获取天气数据失败');
    }

    const current = data.current;

    // 天气代码转中文描述
    const weatherMap = {
      0: '晴',
      1: '晴间多云',
      2: '多云',
      3: '阴',
      45: '雾',
      48: '霜雾',
      51: '小毛毛雨',
      53: '中毛毛雨',
      55: '大毛毛雨',
      61: '小雨',
      63: '中雨',
      65: '大雨',
      71: '小雪',
      73: '中雪',
      75: '大雪',
      77: '雪粒',
      80: '小阵雨',
      81: '中阵雨',
      82: '大阵雨',
      85: '小阵雪',
      86: '大阵雪',
      95: '雷阵雨',
      96: '雷阵雨伴冰雹',
      99: '雷阵雨伴大冰雹',
    };

    const weatherDesc = weatherMap[current.weather_code] || '未知';

    // 根据温度、气压计算钓鱼指数
    const temp = current.temperature_2m;
    const pressure = current.surface_pressure;
    const humidity = current.relative_humidity_2m;
    const wind = current.wind_speed_10m;

    let fishingIndex = 3; // 默认3星
    if (temp >= 15 && temp <= 28 && pressure >= 1005 && pressure <= 1020 && humidity >= 40 && humidity <= 80 && wind <= 5) {
      fishingIndex = 5; // 完美
    } else if (temp >= 10 && temp <= 30 && pressure >= 1000 && pressure <= 1025 && wind <= 7) {
      fishingIndex = 4; // 良好
    } else if (temp >= 5 || temp <= 35 || wind <= 9) {
      fishingIndex = 3; // 一般
    } else if (temp < 5 || temp > 35 || wind > 10) {
      fishingIndex = 2; // 较差
    } else {
      fishingIndex = 1; // 很差
    }

    const fishingAdvice = [
      '气压稳定，水温适宜，适合出钓。',
      '天气良好，适合出钓。',
      '天气一般，鱼口可能一般。',
      '天气较差，建议室内活动。',
      '天气恶劣，不建议出钓。',
    ][Math.max(0, Math.min(4, 5 - fishingIndex))];

    res.json({
      code: 0,
      data: {
        city: cityKey,
        temperature: Math.round(temp),
        pressure: Math.round(pressure),
        humidity: Math.round(humidity),
        wind: `${Math.round(wind)}m/s`,
        water_temp: Math.round(temp - 2),
        fishing_index: fishingIndex,
        fishing_advice: fishingAdvice,
        sunrise: '05:30', // 简化，实际可从API获取
        sunset: '19:00',
        tide_data: [
          { time: '06:12', type: 'up', height: 4.2 },
          { time: '12:35', type: 'down', height: 1.8 },
          { time: '18:48', type: 'up', height: 3.9 },
        ],
        record_date: new Date().toISOString().split('T')[0],
        weather_desc: weatherDesc,
      },
    });
  } catch (err) {
    console.error('天气获取失败:', err);
    res.json({ code: -1, msg: err.message });
  }
});

module.exports = router;