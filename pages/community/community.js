const { API } = require('../../utils/api.js');

function formatTimeAgo(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}

Page({
  data: {
    currentTopic: 'all',
    posts: [],
  },

  onLoad() {
    this.loadPosts();
  },

  onShow() {
    this.loadPosts();
  },

  async loadPosts() {
    try {
      wx.showLoading({ title: '加载中...' });
      const params = {};
      if (this.data.currentTopic !== 'all') {
        params.topic = this.data.currentTopic;
      }
      const result = await API.getPosts(params);
      const posts = (result.list || []).map(p => ({
        id: p.id,
        username: p.author_name || '匿名用户',
        avatar: '',
        time: formatTimeAgo(p.created_at),
        content: p.content,
        images: p.images || [],
        likes: p.likes || 0,
        comments: p.comment_count || 0,
        liked: false,
        topic: p.topic,
        userIcon: '🧑‍🎣',
      }));
      this.setData({ posts });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      console.error('加载帖子失败:', err);
    }
  },

  publish() {
    wx.navigateTo({ url: '/pages/community/publish' });
  },

  selectTopic(e) {
    this.setData({ currentTopic: e.currentTarget.dataset.topic });
    this.loadPosts();
  },

  async likePost(e) {
    try {
      const id = e.currentTarget.dataset.id;
      const res = await API.likePost(id, 1);
      const posts = this.data.posts.map(p => {
        if (p.id === id) {
          return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
        }
        return p;
      });
      this.setData({ posts });
    } catch (err) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/community/detail?id=${id}` });
  },

  commentPost(e) {
    wx.navigateTo({ url: `/pages/community/detail?id=${e.currentTarget.dataset.id}` });
  },
});