const { API } = require('../../utils/api.js');

Page({
  data: {
    spots: [],
    loading: true,
  },

  onLoad() {
    this.loadMySpots();
  },

  async loadMySpots() {
    try {
      wx.showLoading({ title: '加载中...' });
      const openid = 'test_openid_001';
      const user = await API.getUserInfo(openid);
      // 获取用户去过和收藏的钓点
      const result = await API.getSpots({ user_id: user.id, limit: 50 });
      const spots = (result.list || []).map(s => ({
        id: s.id,
        name: s.name,
        address: s.address || '未知地址',
        rating: s.rating || 0,
        checkinCount: s.checkin_count || 0,
        fishTypes: s.fish_types || '未知',
        price: s.price || '免费',
        icon: s.type === 'wild' ? '🏞️' : s.type === 'lure' ? '🌊' : s.type === 'boat' ? '🚤' : '🎣',
        bgColor: s.type === 'wild' ? '#4a9c6d' : s.type === 'lure' ? '#2d5a87' : s.type === 'boat' ? '#5d8aa8' : '#8b7355',
        tags: s.tags || []
      }));
      this.setData({ spots, loading: false });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      this.setData({ loading: false });
      console.error('加载失败:', err);
    }
  },

  goToSpotDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/spots/detail?id=${id}` });
  },
});