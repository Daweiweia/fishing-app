const { API } = require('../../utils/api.js');

Page({
  data: {
    detail: null,
    loading: true,
  },

  onLoad(query) {
    if (query.id) {
      this.setData({ id: query.id });
      this.loadDetail(query.id);
    }
  },

  async loadDetail(id) {
    try {
      wx.showLoading({ title: '加载中...' });
      const result = await API.getCatchLogs({ id });
      if (result.list && result.list.length > 0) {
        const c = result.list[0];
        const iconMap = { '鲈鱼': '🐟', '鲤鱼': '🐠', '草鱼': '🐟', '鳊鱼': '🐡', '鳜鱼': '🐟' };
        const colorMap = { '鲈鱼': '#6bcbef', '鲤鱼': '#ff6b35', '草鱼': '#6bcb7d', '鳊鱼': '#c77dff', '鳜鱼': '#ffd93d' };
        this.setData({
          detail: {
            id: c.id,
            fishName: c.fish_name || '未知',
            size: c.size || 0,
            weight: c.weight || 0,
            date: c.created_at ? c.created_at.split('T')[0] : '',
            spotName: c.spot_name || '',
            content: c.content || '',
            images: c.images || [],
            icon: iconMap[c.fish_name] || '🐟',
            bgColor: colorMap[c.fish_name] || '#6bcbef',
          },
          loading: false,
        });
      } else {
        this.setData({ loading: false });
      }
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      this.setData({ loading: false });
      console.error('加载失败:', err);
    }
  },
});