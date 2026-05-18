const { API } = require('../../utils/api.js');

Page({
  data: {
    fishBook: [],
    catchList: [],
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    try {
      wx.showLoading({ title: '加载中...' });

      // 获取当前用户ID，模拟用 test_openid_001
      const userId = 1;

      const [fishbook, catches] = await Promise.all([
        API.getFishBook(userId),
        API.getCatchLogs({ user_id: userId })
      ]);

      // 处理鱼谱
      const fishBook = (fishbook || []).map(f => {
        const iconMap = { '鲈鱼': '🐟', '鲤鱼': '🐠', '草鱼': '🐟', '鳊鱼': '🐡', '鳜鱼': '🐟' };
        const colorMap = { '鲈鱼': '#6bcbef', '鲤鱼': '#ff6b35', '草鱼': '#6bcb7d', '鳊鱼': '#c77dff', '鳜鱼': '#ffd93d' };
        return {
          id: f.fish_name,
          name: f.fish_name,
          count: f.count,
          icon: iconMap[f.fish_name] || '🐟',
          bgColor: colorMap[f.fish_name] || '#6bcbef'
        };
      });

      // 处理鱼获记录
      const catchList = (catches.list || []).map(c => {
        const iconMap = { '鲈鱼': '🐟', '鲤鱼': '🐠', '草鱼': '🐟', '鳊鱼': '🐡', '鳜鱼': '🐟' };
        const colorMap = { '鲈鱼': '#6bcbef', '鲤鱼': '#ff6b35', '草鱼': '#6bcb7d', '鳊鱼': '#c77dff', '鳜鱼': '#ffd93d' };
        return {
          id: c.id,
          fishName: c.fish_name,
          size: c.size || 0,
          weight: c.weight || 0,
          date: c.created_at ? c.created_at.split('T')[0].slice(5) : '',
          spotName: c.spot_name || '',
          icon: iconMap[c.fish_name] || '🐟',
          bgColor: colorMap[c.fish_name] || '#6bcbef'
        };
      });

      this.setData({ fishBook, catchList });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      console.error('加载数据失败:', err);
    }
  },

  publishCatch() {
    wx.navigateTo({ url: '/pages/catchlog/publish' });
  },

  viewFishBook() {
    wx.navigateTo({ url: '/pages/catchlog/fishbook' });
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/catchlog/detail?id=${e.currentTarget.dataset.id}` });
  },
});