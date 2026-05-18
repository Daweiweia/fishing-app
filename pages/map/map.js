const { API } = require('../../utils/api.js');

Page({
  data: {
    latitude: 30.25,
    longitude: 120.18,
    keyword: '',
    markers: [],
    spots: [],
    showDetail: false,
    selectedSpot: null,
  },

  onLoad() {
    this.loadSpots();
  },

  async loadSpots() {
    try {
      wx.showLoading({ title: '加载中...' });
      const result = await API.getSpots({ limit: 50 });

      const spots = (result.list || []).map(s => ({
        id: s.id,
        name: s.name,
        address: s.address || '未知地址',
        latitude: parseFloat(s.latitude) || 30.25,
        longitude: parseFloat(s.longitude) || 120.18,
        rating: s.rating || 0,
        checkinCount: s.checkin_count || 0,
        fishTypes: s.fish_types || '未知',
        bait: s.bait || '未知',
        openHours: s.open_hours || '未知',
        price: s.price || '未知',
        icon: s.type === 'wild' ? '🏞️' : s.type === 'lure' ? '🌊' : s.type === 'boat' ? '🚤' : s.type === 'pond' ? '🎣' : '📍',
        bgColor: s.type === 'wild' ? '#4a9c6d' : s.type === 'lure' ? '#2d5a87' : s.type === 'boat' ? '#5d8aa8' : '#8b7355',
        tags: s.tags || []
      }));

      const markers = spots.map(s => ({
        id: s.id,
        latitude: s.latitude,
        longitude: s.longitude,
        width: 40,
        height: 40,
        iconPath: '/images/marker.png',
        callout: {
          content: s.name,
          color: '#333',
          fontSize: 12,
          borderRadius: 8,
          padding: 6,
          display: 'ALWAYS',
          bgColor: 'white'
        }
      }));

      this.setData({ spots, markers });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      console.error('加载钓点失败:', err);
      // 使用模拟数据
      this.setData({
        markers: [{
          id: 1,
          latitude: 30.251,
          longitude: 120.148,
          width: 40,
          height: 40,
          iconPath: '/images/marker.png',
          callout: { content: '西湖断桥', color: '#333', fontSize: 12, borderRadius: 8, padding: 6, display: 'ALWAYS', bgColor: 'white' }
        }]
      });
    }
  },

  onSearch(e) {
    const keyword = e.detail.value || this.data.keyword;
    this.setData({ keyword });
    // TODO: 搜索钓点
    wx.showToast({ title: '搜索功能开发中', icon: 'none' });
  },

  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const spot = this.data.spots.find(s => s.id === markerId);
    if (spot) {
      this.setData({ showDetail: true, selectedSpot: spot });
    }
  },

  onSpotItemTap(e) {
    const id = e.currentTarget.dataset.id;
    const spot = this.data.spots.find(s => s.id === id);
    if (spot) {
      this.setData({
        latitude: spot.latitude,
        longitude: spot.longitude,
        showDetail: true,
        selectedSpot: spot
      });
    }
  },

  toggleSheet() {
    this.setData({ showDetail: !this.data.showDetail });
  },

  closeDetail() {
    this.setData({ showDetail: false });
  },

  navigateToSpot() {
    const spot = this.data.selectedSpot;
    if (!spot) return;

    wx.openLocation({
      latitude: spot.latitude,
      longitude: spot.longitude,
      name: spot.name,
      address: spot.address,
      scale: 15
    });
  },

  async checkinSpot() {
    const spot = this.data.selectedSpot;
    if (!spot) return;

    try {
      wx.showLoading({ title: '打卡中...' });
      // TODO: 调用后端打卡接口
      wx.hideLoading();
      wx.showToast({ title: '打卡成功！', icon: 'success' });
      this.closeDetail();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '打卡失败', icon: 'none' });
    }
  },
});