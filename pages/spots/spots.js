const { API } = require('../../utils/api.js');

Page({
  data: {
    currentCategory: 'all',
    spots: [],
    searchKeyword: '',
  },

  onLoad() {
    this.loadSpots();
  },

  loadSpots(queryParams = {}) {
    const { currentCategory, searchKeyword } = this.data;
    const params = { ...queryParams };
    if (currentCategory !== 'all') params.type = currentCategory;
    if (searchKeyword) params.keyword = searchKeyword;

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
    const keyword = e.detail.value || '';
    this.setData({ searchKeyword: keyword });
    this.loadSpots({ keyword });
  },

  selectCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ currentCategory: cat, searchKeyword: '' });
    this.loadSpots({ type: cat !== 'all' ? cat : undefined });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: `/pages/spots/detail?id=${id}` });
    }
  },

  addSpot() {
    wx.navigateTo({ url: '/pages/spots/add' });
  },

  goToMap() {
    wx.navigateTo({ url: '/pages/map/map' });
  },
});