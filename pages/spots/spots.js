const { API } = require('../../utils/api.js');

Page({
  data: {
    currentCategory: 'all',
    spots: [],
  },

  onLoad() {
    this.loadSpots();
  },

  loadSpots() {
    const params = {};
    if (this.data.currentCategory !== 'all') {
      params.type = this.data.currentCategory;
    }
    API.getSpots(params).then(result => {
      const list = result && result.list ? result.list : [];
      const spots = list.map(s => ({
        id: s.id,
        name: s.name || '',
        distance: '0',
        rating: s.rating || 0,
        checkins: s.checkin_count || 0,
        icon: (s.type === 'wild' ? '🏞️' : s.type === 'lure' ? '🌊' : s.type === 'boat' ? '🚤' : s.type === 'pond' ? '🎣' : '📍'),
        bgColor: (s.type === 'wild' ? '#4a9c6d' : s.type === 'lure' ? '#2d5a87' : s.type === 'boat' ? '#5d8aa8' : '#8b7355'),
        tags: (s.tags || [])
      }));
      this.setData({ spots });
    }).catch(err => {
      console.error('loadSpots error:', err);
    });
  },

  onSearch(e) {
    console.log('搜索:', e.detail.value);
  },

  showFilter() {
    wx.showToast({ title: '筛选功能开发中', icon: 'none' });
  },

  selectCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ currentCategory: cat });
    this.loadSpots();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: `/pages/spots/detail?id=${id}` });
    }
  },

  addSpot() {
    wx.showToast({ title: '添加钓点功能开发中', icon: 'none' });
  },

  goToMap() {
    wx.navigateTo({ url: '/pages/map/map' });
  },
});