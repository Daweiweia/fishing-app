const app = getApp();
const { API } = require('../../utils/api.js');

function getUserId() {
  return app.globalData.openid || wx.getStorageSync('openid') || '';
}

const topics = [
  { key: 'skill', label: '#技巧' },
  { key: 'gear', label: '#渔具' },
  { key: 'spot', label: '#钓点' },
  { key: 'fish', label: '#鱼种' },
];

Page({
  data: {
    topics,
    selectedTopic: '',
    content: '',
    images: [],
    submitting: false,
  },

  onTopicTap(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ selectedTopic: this.data.selectedTopic === key ? '' : key });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onAddImage() {
    if (this.data.images.length >= 9) {
      wx.showToast({ title: '最多9张', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: 9 - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const imgs = res.tempFiles.map(f => f.tempFilePath);
        this.setData({ images: this.data.images.concat(imgs) });
      },
    });
  },

  onRemoveImage(e) {
    const idx = e.currentTarget.dataset.idx;
    const images = [...this.data.images];
    images.splice(idx, 1);
    this.setData({ images });
  },

  async onSubmit() {
    const { content, selectedTopic, images } = this.data;
    if (!content.trim()) return wx.showToast({ title: '请输入内容', icon: 'none' });

    this.setData({ submitting: true });
    try {
      // 上传图片
      let uploadedUrls = [];
      if (images && images.length > 0) {
        wx.showLoading({ title: '上传图片...' });
        uploadedUrls = await API.uploadImages(images);
      }

      await API.publishPost({
        content: content.trim(),
        topic: selectedTopic,
        images: uploadedUrls,
        author_id: getUserId(),
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