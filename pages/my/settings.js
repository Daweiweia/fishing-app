Page({
  data: {
    version: '1.0.0',
  },

  onLoad() {
    const app = getApp();
    this.setData({ version: app.version || '1.0.0' });
  },

  onClearCache() {
    wx.showModal({
      title: '确认清除',
      content: '确定清除本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  },

  onAbout() {
    wx.showModal({
      title: '关于去哪钓',
      content: '去哪钓 - 钓鱼爱好者社区\n为钓鱼人打造的钓点发现、鱼获记录分享平台',
      showCancel: false,
    });
  },
});