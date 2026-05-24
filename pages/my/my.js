const { API } = require('../../utils/api.js');

Page({
  data: {
    userInfo: {
      nickname: '点击登录',
      bio: '',
      avatar: '',
      userIcon: '🧑‍💻',
      fishCount: 0,
      catchCount: 0,
      spotCount: 0,
    },
    loggedIn: false,
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
  },

  checkLogin() {
    const openid = wx.getStorageSync('openid');
    if (openid) {
      this.globalData = getApp().globalData;
      getApp().globalData.openid = openid;
      this.loadUserInfo(openid);
    }
  },

  async loadUserInfo(openid) {
    try {
      const user = await API.getUserInfo(openid);
      const iconMap = { '鲈鱼': '🐟', '鲤鱼': '🐠', '草鱼': '🐟', '鳊鱼': '🐡', '鳜鱼': '🐟' };
      this.setData({
        userInfo: {
          nickname: user.nickname || '钓鱼新手',
          bio: user.bio || '',
          avatar: user.avatar || '',
          userIcon: '🧑‍🎣',
          fishCount: user.fish_count || 0,
          catchCount: user.catch_count || 0,
          spotCount: user.spot_count || 0,
        },
        loggedIn: true,
      });
    } catch (err) {
      console.error('加载用户信息失败:', err);
    }
  },

  onLoginTap() {
    if (this.data.loggedIn) return;
    wx.getUserProfile({
      desc: '用于完善个人资料',
      success: async (res) => {
        const { userInfo } = res;
        wx.showLoading({ title: '登录中...' });
        try {
          // 先获取 openid
          const codeRes = await new Promise((resolve, reject) => {
            wx.login({
              success: (r) => resolve(r),
              fail: reject,
            });
          });

          // 调用后端 login 接口（需要配合微信云开发或自建 auth 服务）
          // 这里先模拟：用 code 作为临时标识
          const tempOpenid = `wx_${codeRes.code}`;
          const user = await API.login({
            openid: tempOpenid,
            nickname: userInfo.nickName,
            avatar: userInfo.avatarUrl,
          });

          wx.setStorageSync('openid', user.openid);
          getApp().globalData.openid = user.openid;

          this.setData({
            userInfo: {
              nickname: user.nickname || userInfo.nickName,
              bio: user.bio || '',
              avatar: user.avatar || userInfo.avatarUrl,
              userIcon: '🧑‍🎣',
              fishCount: user.fish_count || 0,
              catchCount: user.catch_count || 0,
              spotCount: user.spot_count || 0,
            },
            loggedIn: true,
          });
          wx.hideLoading();
          wx.showToast({ title: '登录成功', icon: 'success' });
        } catch (err) {
          wx.hideLoading();
          wx.showToast({ title: '登录失败', icon: 'none' });
        }
      },
    });
  },

  goToMySpots() {
    if (!this.data.loggedIn) return wx.showToast({ title: '请先登录', icon: 'none' });
    wx.navigateTo({ url: '/pages/my/spots' });
  },

  goToMyCatches() {
    if (!this.data.loggedIn) return wx.showToast({ title: '请先登录', icon: 'none' });
    wx.switchTab({ url: '/pages/catchlog/catchlog' });
  },

  goToMyPosts() {
    if (!this.data.loggedIn) return wx.showToast({ title: '请先登录', icon: 'none' });
    wx.navigateTo({ url: '/pages/my/posts' });
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/my/settings' });
  },
});