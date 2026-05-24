const { API } = require('../../utils/api.js');

Page({
  data: {
    fishBook: [],
    loading: true,
  },

  onLoad() {
    this.loadFishBook();
  },

  async loadFishBook() {
    try {
      wx.showLoading({ title: '加载中...' });
      const userId = 1;
      const fishbook = await API.getFishBook(userId);
      const fishBook = (fishbook || []).map(f => {
        const iconMap = { '鲈鱼': '🐟', '鲤鱼': '🐠', '草鱼': '🐟', '鳊鱼': '🐡', '鳜鱼': '🐟', '鲢鳙': '🐟', '青鱼': '🐟', '鲫鱼': '🐟', '黑鱼': '🐟', '罗非': '🐟' };
        const colorMap = { '鲈鱼': '#6bcbef', '鲤鱼': '#ff6b35', '草鱼': '#6bcb7d', '鳊鱼': '#c77dff', '鳜鱼': '#ffd93d', '鲢鳙': '#a8d8ea', '青鱼': '#52b788', '鲫鱼': '#9dc3c1', '黑鱼': '#4a4a4a', '罗非': '#e07a5f' };
        return {
          id: f.fish_name,
          name: f.fish_name,
          count: f.count,
          icon: iconMap[f.fish_name] || '🐟',
          bgColor: colorMap[f.fish_name] || '#6bcbef',
        };
      });
      this.setData({ fishBook, loading: false });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      this.setData({ loading: false });
      console.error('加载失败:', err);
    }
  },
});