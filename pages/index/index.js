const { API } = require('../../utils/api.js');

Page({
  data: {
    nearbySpots: [],
    fishingIndex: 0,
    fishingTips: [],
    hotCatches: [],
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    Promise.all([
      API.getSpots({ limit: 10 }).catch(() => ({ list: [] })),
      API.getWeather('杭州').catch(() => ({})),
      API.getCatchLogs({ limit: 6 }).catch(() => ({ list: [] }))
    ]).then(([spots, weather, catches]) => {
      const nearbySpots = (spots.list || []).slice(0, 6).map(s => ({
        id: s.id,
        name: s.name || '',
        distance: '0',
        icon: s.type === 'wild' ? '🏞️' : s.type === 'lure' ? '🌊' : s.type === 'boat' ? '🚤' : '🎣',
        bgColor: s.type === 'wild' ? '#4a9c6d' : s.type === 'lure' ? '#2d5a87' : s.type === 'boat' ? '#5d8aa8' : '#8b7355',
        tags: s.tags || []
      }));

      const tips = [];
      if (weather.fishing_index >= 4) tips.push('适合出钓');
      if (weather.pressure > 1000) tips.push('气压稳定');
      if (weather.water_temp > 15 && weather.water_temp < 25) tips.push('水温适宜');

      const hotCatches = (catches.list || []).slice(0, 3).map(c => ({
        id: c.id,
        fishName: c.fish_name || '未知鱼种',
        size: c.size || 0,
        weight: c.weight || 0,
        icon: '🐟',
        bgColor: '#6bcbef'
      }));

      this.setData({ nearbySpots, fishingIndex: weather.fishing_index || 0, fishingTips: tips, hotCatches });
    }).catch(err => {
      console.error('loadData error:', err);
    });
  },

  goToSpots() {
    wx.switchTab({ url: '/pages/spots/spots' });
  },

  goToWeather() {
    wx.switchTab({ url: '/pages/weather/weather' });
  },

  goToCatchlog() {
    wx.switchTab({ url: '/pages/catchlog/catchlog' });
  },

  goToCommunity() {
    wx.navigateTo({ url: '/pages/community/community' });
  },

  goToSpotDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/spots/detail?id=${id}` });
  },
});