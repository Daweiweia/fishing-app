const { API } = require('../../utils/api.js');

Page({
  data: {
    fishTypes: ['鲈鱼', '鲤鱼', '草鱼', '鳊鱼', '鳜鱼', '鲢鳙', '青鱼', '鲫鱼', '黑鱼', '罗非'],
    spotList: [],
    formData: {
      fish_name: '',
      size: '',
      weight: '',
      spot_id: '',
      spot_name: '',
      content: '',
      images: [],
    },
    submitting: false,
  },

  onLoad() {
    this.loadSpots();
  },

  async loadSpots() {
    try {
      const result = await API.getSpots({ limit: 100 });
      this.setData({ spotList: result.list || [] });
    } catch (err) {
      console.error('加载钓点失败:', err);
    }
  },

  onFishTypeTap(e) {
    const fish = e.currentTarget.dataset.fish;
    this.setData({ 'formData.fish_name': fish });
  },

  onSpotChange(e) {
    const idx = e.detail.value;
    const spot = this.data.spotList[idx];
    if (spot) {
      this.setData({
        'formData.spot_id': spot.id,
        'formData.spot_name': spot.name,
      });
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  onAddImage() {
    if (this.data.formData.images.length >= 9) {
      wx.showToast({ title: '最多9张', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: 9 - this.data.formData.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const imgs = res.tempFiles.map(f => f.tempFilePath);
        this.setData({ 'formData.images': this.data.formData.images.concat(imgs) });
      },
    });
  },

  onRemoveImage(e) {
    const idx = e.currentTarget.dataset.idx;
    const images = [...this.data.formData.images];
    images.splice(idx, 1);
    this.setData({ 'formData.images': images });
  },

  async onSubmit() {
    const { fish_name, size, weight, spot_id, spot_name } = this.data.formData;
    if (!fish_name) return wx.showToast({ title: '请选择鱼种', icon: 'none' });
    if (!spot_id) return wx.showToast({ title: '请选择钓点', icon: 'none' });

    this.setData({ submitting: true });
    try {
      await API.publishCatch({
        fish_name,
        size: parseFloat(size) || 0,
        weight: parseFloat(weight) || 0,
        spot_id,
        spot_name,
        user_id: 1,
      });
      wx.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: err.message || '发布失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});