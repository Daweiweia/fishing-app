const { API } = require('../../utils/api.js');

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hour}:${min}`;
}

Page({
  data: {
    spotId: null,
    spot: {},
    latitude: 30.25,
    longitude: 120.18,
    markers: [],
    catchList: [],
    reviews: [],
    reviewPage: 1,
    hasMoreReviews: true,
    reviewLoading: false,
    reviewText: '',
    reviewRating: 5,
  },

  onLoad(options) {
    const { id } = options;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return wx.navigateBack();
    }
    this.setData({ spotId: parseInt(id) });
    this.loadSpotDetail(id);
    this.loadReviews(id);
  },

  async loadSpotDetail(id) {
    try {
      wx.showLoading({ title: '加载中...' });
      const spot = await API.getSpotDetail(id);
      const bgColorMap = { wild: '#4a9c6d', lure: '#2d5a87', boat: '#5d8aa8', pond: '#8b7355', free: '#4a9c6d' };
      const iconMap = { wild: '🏞️', lure: '🌊', boat: '🚤', pond: '🎣', free: '📍' };

      const ratingVal = spot.rating || 0;
      const fullStars = Math.floor(ratingVal);
      const halfStar = ratingVal % 1 >= 0.5;
      const ratingStars = '★'.repeat(fullStars) + (halfStar ? '☆' : '');

      const spotData = {
        id: spot.id,
        name: spot.name,
        address: spot.address || '未知地址',
        latitude: parseFloat(spot.latitude) || 30.25,
        longitude: parseFloat(spot.longitude) || 120.18,
        rating: ratingVal,
        ratingStars: ratingStars || '暂无评分',
        checkinCount: spot.checkin_count || 0,
        fishTypes: spot.fish_types || '',
        bait: spot.bait || '',
        openHours: spot.open_hours || '',
        price: spot.price || '',
        type: spot.type || 'free',
        tags: spot.tags || [],
        icon: iconMap[spot.type] || '📍',
        bgColor: bgColorMap[spot.type] || '#4a9c6d',
      };

      const markers = [{
        id: spot.id,
        latitude: spotData.latitude,
        longitude: spotData.longitude,
        width: 50,
        height: 50,
        iconPath: '/images/marker.png'
      }];

      this.setData({
        spot: spotData,
        latitude: spotData.latitude,
        longitude: spotData.longitude,
        markers,
      });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      console.error('加载钓点详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onNavigate() {
    const { spot } = this.data;
    wx.openLocation({
      latitude: spot.latitude,
      longitude: spot.longitude,
      name: spot.name,
      address: spot.address,
      scale: 15
    });
  },

  onCheckin() {
    wx.showToast({ title: '打卡成功！', icon: 'success' });
  },

  onCollect() {
    wx.showToast({ title: '收藏成功！', icon: 'success' });
  },

  // ========== 点评相关 ==========
  loadReviews(spotId, append = false, force = false) {
    const { reviewPage, reviewLoading, hasMoreReviews } = this.data;
    if (!force && reviewLoading) return;
    if (!force && !append && !hasMoreReviews) return;
    this.setData({ reviewLoading: true });
    const page = append ? reviewPage + 1 : 1;

    API.getSpotReviews(spotId, page).then(res => {
      const newReviews = res.list || [];
      const formattedReviews = newReviews.map(r => ({
        ...r,
        created_at: r.created_at ? formatTime(r.created_at) : '',
      }));
      this.setData({
        reviews: append ? this.data.reviews.concat(formattedReviews) : formattedReviews,
        reviewPage: page,
        hasMoreReviews: newReviews.length >= 10,
        reviewLoading: false,
      });
    }).catch(() => {
      this.setData({ reviewLoading: false });
    });
  },

  onReviewInput(e) {
    this.setData({ reviewText: e.detail.value });
  },

  onReviewStarChange(e) {
    this.setData({ reviewRating: e.currentTarget.dataset.val });
  },

  onMoreReviews() {
    const { spotId } = this.data;
    this.loadReviews(spotId, true);
  },

  onSubmitReview() {
    const { spotId, reviewText, reviewRating } = this.data;
    if (!reviewText || reviewText.trim().length < 5) {
      wx.showToast({ title: '请输入至少5个字', icon: 'none' });
      return;
    }

    API.addSpotReview({
      spot_id: spotId,
      user_id: 0,
      user_name: '匿名用户',
      rating: reviewRating,
      content: reviewText,
      fish_result: '',
    }).then(() => {
      wx.showToast({ title: '发布成功', icon: 'success' });
      this.setData({ reviewText: '', reviewRating: 5, hasMoreReviews: true, reviewPage: 1 });
      this.loadReviews(spotId, false, true);
    }).catch(err => {
      wx.showToast({ title: err.message || '发布失败', icon: 'none' });
    });
  },

  onReviewScrollToLower() {
    const { spotId } = this.data;
    this.loadReviews(spotId, true);
  },
});