const { API } = require('../../utils/api.js');

const cities = ['杭州', '上海', '北京', '广州', '深圳', '成都', '武汉', '南京'];

Page({
  data: {
    city: '杭州',
    cities: cities,
    date: '',
    temperature: 0,
    weatherDesc: '',
    pressure: 0,
    humidity: 0,
    wind: '',
    waterTemp: 0,
    fishingIndex: 0,
    fishingAdvice: '',
    tideData: [],
    sunrise: '',
    sunset: '',
  },

  onLoad() {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.setData({ date });
    this.loadWeather();
  },

  onCityTap(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({ city });
    this.loadWeather();
  },

  async loadWeather() {
    try {
      wx.showLoading({ title: '加载中...' });
      const weather = await API.getWeather(this.data.city);
      this.setData({
        temperature: weather.temperature || 0,
        weatherDesc: weather.weather_desc || '多云',
        pressure: weather.pressure || 0,
        humidity: weather.humidity || 0,
        wind: weather.wind || '-',
        waterTemp: weather.water_temp || 0,
        fishingIndex: weather.fishing_index || 0,
        fishingAdvice: weather.fishing_advice || '',
        sunrise: weather.sunrise || '',
        sunset: weather.sunset || '',
        tideData: weather.tide_data || []
      });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      console.error('加载天气失败:', err);
    }
  },
});