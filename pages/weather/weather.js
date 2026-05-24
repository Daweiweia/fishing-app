const { API } = require('../../utils/api.js');

const allCities = [
  '杭州','上海','北京','广州','深圳','成都','武汉','南京','重庆','西安','苏州','长沙','郑州','济南','福州','厦门','宁波','青岛','合肥','昆明','沈阳','大连','长春','哈尔滨','石家庄','太原','呼和浩特','南宁','贵阳','拉萨','兰州','西宁','银川','乌鲁木齐','海口','天津','南昌','温州','东莞','佛山','无锡','常州','徐州','南通','扬州','盐城','淮安','泰州','镇江','台州','金华','绍兴','嘉兴','湖州','丽水','衢州','舟山','芜湖','蚌埠','淮南','马鞍山','淮北','铜陵','安庆','黄山','滁州','阜阳','宿州','六安','亳州','池州','宣城','莆田','三明','南平','龙岩','宁德','漳州','泉州','景德镇','萍乡','九江','新余','赣州','吉安','宜春','抚州','上饶','烟台','潍坊','威海','淄博','枣庄','东营','济宁','泰安','日照','莱芜','临沂','德州','滨州','菏泽'
];

// 城市经纬度表（用于逆地理编码）
const cityCoords = {
  '杭州': { lat: 30.25, lon: 120.18 },
  '上海': { lat: 31.23, lon: 121.47 },
  '北京': { lat: 39.91, lon: 116.39 },
  '广州': { lat: 23.12, lon: 113.26 },
  '深圳': { lat: 22.54, lon: 114.06 },
  '成都': { lat: 30.67, lon: 104.07 },
  '武汉': { lat: 30.58, lon: 114.29 },
  '南京': { lat: 32.06, lon: 118.78 },
  '重庆': { lat: 29.56, lon: 106.55 },
  '西安': { lat: 34.27, lon: 108.95 },
  '苏州': { lat: 31.30, lon: 120.58 },
  '长沙': { lat: 28.23, lon: 112.94 },
  '郑州': { lat: 34.77, lon: 113.63 },
  '天津': { lat: 39.13, lon: 117.20 },
  '济南': { lat: 36.65, lon: 117.12 },
  '福州': { lat: 26.08, lon: 119.30 },
  '厦门': { lat: 24.48, lon: 118.10 },
  '宁波': { lat: 29.88, lon: 121.55 },
  '青岛': { lat: 36.07, lon: 120.37 },
  '合肥': { lat: 31.85, lon: 117.28 },
  '昆明': { lat: 25.04, lon: 102.71 },
  '沈阳': { lat: 41.80, lon: 123.43 },
  '大连': { lat: 38.91, lon: 121.62 },
  '长春': { lat: 43.88, lon: 125.32 },
  '哈尔滨': { lat: 45.80, lon: 126.53 },
  '石家庄': { lat: 38.04, lon: 114.48 },
  '太原': { lat: 37.87, lon: 112.55 },
  '呼和浩特': { lat: 40.84, lon: 111.73 },
  '南宁': { lat: 22.82, lon: 108.37 },
  '贵阳': { lat: 26.65, lon: 106.63 },
  '拉萨': { lat: 29.65, lon: 91.12 },
  '兰州': { lat: 36.06, lon: 103.83 },
  '西宁': { lat: 36.62, lon: 101.78 },
  '银川': { lat: 38.47, lon: 106.27 },
  '乌鲁木齐': { lat: 43.83, lon: 87.62 },
  '海口': { lat: 20.03, lon: 110.35 },
  '南昌': { lat: 28.68, lon: 115.85 },
  '温州': { lat: 28.00, lon: 120.70 },
  '东莞': { lat: 23.05, lon: 113.75 },
  '佛山': { lat: 23.02, lon: 113.12 },
  '无锡': { lat: 31.49, lon: 120.30 },
  '常州': { lat: 31.81, lon: 119.97 },
  '徐州': { lat: 34.20, lon: 117.29 },
  '南通': { lat: 32.01, lon: 120.90 },
  '扬州': { lat: 32.39, lon: 119.42 },
  '盐城': { lat: 33.35, lon: 120.16 },
  '淮安': { lat: 33.60, lon: 119.02 },
  '泰州': { lat: 32.46, lon: 119.92 },
  '镇江': { lat: 32.20, lon: 119.45 },
  '台州': { lat: 28.66, lon: 121.13 },
  '金华': { lat: 29.08, lon: 119.65 },
  '绍兴': { lat: 30.00, lon: 120.58 },
  '嘉兴': { lat: 30.74, lon: 120.76 },
  '湖州': { lat: 30.87, lon: 120.14 },
  '丽水': { lat: 28.46, lon: 119.92 },
  '衢州': { lat: 28.97, lon: 118.87 },
  '舟山': { lat: 29.99, lon: 122.20 },
  '芜湖': { lat: 31.35, lon: 118.43 },
  '蚌埠': { lat: 32.94, lon: 117.38 },
  '淮南': { lat: 32.63, lon: 117.00 },
  '马鞍山': { lat: 31.67, lon: 118.51 },
  '淮北': { lat: 33.96, lon: 116.80 },
  '铜陵': { lat: 30.95, lon: 117.81 },
  '安庆': { lat: 30.54, lon: 117.06 },
  '黄山': { lat: 29.72, lon: 118.34 },
  '滁州': { lat: 32.30, lon: 118.32 },
  '阜阳': { lat: 32.89, lon: 115.82 },
  '宿州': { lat: 33.65, lon: 116.97 },
  '六安': { lat: 31.73, lon: 116.52 },
  '亳州': { lat: 33.84, lon: 115.78 },
  '池州': { lat: 30.67, lon: 117.48 },
  '宣城': { lat: 30.94, lon: 118.75 },
  '莆田': { lat: 25.45, lon: 119.30 },
  '三明': { lat: 26.27, lon: 117.63 },
  '南平': { lat: 26.64, lon: 118.17 },
  '龙岩': { lat: 25.10, lon: 117.03 },
  '宁德': { lat: 26.67, lon: 119.55 },
  '漳州': { lat: 24.51, lon: 117.65 },
  '泉州': { lat: 24.88, lon: 118.68 },
  '景德镇': { lat: 29.27, lon: 117.18 },
  '萍乡': { lat: 27.62, lon: 113.85 },
  '九江': { lat: 29.71, lon: 116.00 },
  '新余': { lat: 27.82, lon: 114.92 },
  '赣州': { lat: 25.85, lon: 114.93 },
  '吉安': { lat: 27.11, lon: 114.99 },
  '宜春': { lat: 27.81, lon: 114.42 },
  '抚州': { lat: 27.95, lon: 116.36 },
  '上饶': { lat: 28.46, lon: 117.94 },
  '烟台': { lat: 37.53, lon: 121.40 },
  '潍坊': { lat: 36.70, lon: 119.16 },
  '威海': { lat: 37.51, lon: 122.12 },
  '淄博': { lat: 36.83, lon: 118.06 },
  '枣庄': { lat: 34.81, lon: 117.32 },
  '东营': { lat: 37.43, lon: 118.67 },
  '济宁': { lat: 35.41, lon: 116.59 },
  '泰安': { lat: 36.19, lon: 117.09 },
  '日照': { lat: 35.42, lon: 119.53 },
  '莱芜': { lat: 36.21, lon: 117.66 },
  '临沂': { lat: 35.10, lon: 118.36 },
  '德州': { lat: 37.44, lon: 116.30 },
  '滨州': { lat: 37.38, lon: 117.97 },
  '菏泽': { lat: 35.23, lon: 115.48 },
};

Page({
  data: {
    currentCity: '杭州',
    cities: allCities,
    filteredCities: allCities,
    date: '',
    showCityPicker: false,
    searchValue: '',
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
    this.initLocation();
  },

  // 初始化定位
  initLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res;
        const nearestCity = this.findNearestCity(latitude, longitude);
        this.setData({ currentCity: nearestCity });
        this.loadWeather(nearestCity);
      },
      fail: () => {
        this.loadWeather(this.data.currentCity);
      }
    });
  },

  // 根据坐标找最近的城市
  findNearestCity(lat, lon) {
    let nearest = '杭州';
    let minDist = Infinity;
    for (const [city, coord] of Object.entries(cityCoords)) {
      const dist = Math.sqrt(Math.pow(lat - coord.lat, 2) + Math.pow(lon - coord.lon, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = city;
      }
    }
    return nearest;
  },

  // 展开城市选择器
  toggleCityPicker() {
    this.setData({ showCityPicker: !this.data.showCityPicker, searchValue: '', filteredCities: this.data.cities });
  },

  // 搜索城市
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    if (!keyword) {
      this.setData({ filteredCities: this.data.cities, searchValue: '' });
      return;
    }
    const filtered = this.data.cities.filter(city => city.includes(keyword));
    this.setData({ filteredCities: filtered, searchValue: keyword });
  },

  // 清除搜索
  onSearchClear() {
    this.setData({ searchValue: '', filteredCities: this.data.cities });
  },

  onCityTap(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({ currentCity: city, showCityPicker: false, searchValue: '', filteredCities: this.data.cities });
    this.loadWeather(city);
  },

  async loadWeather(city) {
    try {
      wx.showLoading({ title: '加载中...' });
      const weather = await API.getWeather(city || this.data.currentCity);
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