const { API } = require('../../utils/api.js');

Page({
  data: {
    latitude: 30.25,
    longitude: 120.18,
    keyword: '',
    searchResult: [],
    isSearching: false,
    markers: [],
    spots: [],
    showDetail: false,
    selectedSpot: null,
    showSearchResult: false,
  },

  onLoad() {
    this.loadSpots();
  },

  async loadSpots() {
    try {
      wx.showLoading({ title: '加载中...' });
      const result = await API.getSpots({ limit: 100 });
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

  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ keyword });
    if (!keyword) {
      this.setData({ searchResult: [], showSearchResult: false });
      return;
    }
    // 前端过滤
    const result = this.data.spots.filter(s =>
      s.name.includes(keyword) || s.address.includes(keyword) || s.fishTypes.includes(keyword)
    );
    this.setData({ searchResult: result, showSearchResult: true });
  },

  onSearchConfirm(e) {
    const keyword = e.detail.value || this.data.keyword;
    this.setData({ keyword });
    this.doSearch(keyword);
  },

  onSearch() {
    this.doSearch(this.data.keyword);
  },

  doSearch(keyword) {
    if (!keyword.trim()) return;
    const result = this.data.spots.filter(s =>
      s.name.includes(keyword) || s.address.includes(keyword) || s.fishTypes.includes(keyword)
    );
    this.setData({ searchResult: result, showSearchResult: true });
  },

  onClearSearch() {
    this.setData({ keyword: '', searchResult: [], showSearchResult: false });
  },

  onSearchItemTap(e) {
    const id = e.currentTarget.dataset.id;
    const spot = this.data.spots.find(s => s.id === id);
    if (spot) {
      this.setData({
        latitude: spot.latitude,
        longitude: spot.longitude,
        showDetail: true,
        selectedSpot: spot,
        showSearchResult: false,
        keyword: '',
      });
    }
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
      await API.checkinSpot({ spot_id: spot.id, user_id: 1 });
      wx.hideLoading();
      wx.showToast({ title: '打卡成功！', icon: 'success' });
      // 更新本地数据
      const spots = this.data.spots.map(s => {
        if (s.id === spot.id) {
          return { ...s, checkinCount: (s.checkinCount || 0) + 1 };
        }
        return s;
      });
      const selectedSpot = { ...spot, checkinCount: (spot.checkinCount || 0) + 1 };
      this.setData({ spots, selectedSpot });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '打卡失败', icon: 'none' });
    }
  },
});