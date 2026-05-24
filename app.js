App({
  globalData: {
    openid: '',
    userInfo: null,
  },

  onLaunch() {
    // 检查本地缓存的 openid
    const openid = wx.getStorageSync('openid') || '';
    if (openid) {
      this.globalData.openid = openid;
    }
  },
});