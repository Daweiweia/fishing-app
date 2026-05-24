const { API } = require('../../utils/api.js');

Page({
  data: {
    posts: [],
    loading: true,
  },

  onLoad() {
    this.loadMyPosts();
  },

  async loadMyPosts() {
    try {
      wx.showLoading({ title: '加载中...' });
      const result = await API.getPosts({ author_id: 1 });
      const posts = (result.list || []).map(p => ({
        id: p.id,
        content: p.content,
        time: p.created_at ? new Date(p.created_at).toLocaleDateString('zh-CN') : '',
        likes: p.likes || 0,
        comments: p.comment_count || 0,
        images: p.images || [],
        topic: p.topic || '',
      }));
      this.setData({ posts, loading: false });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      this.setData({ loading: false });
      console.error('加载失败:', err);
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/community/detail?id=${id}` });
  },
});