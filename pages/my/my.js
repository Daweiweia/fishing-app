const { API } = require('../../utils/api.js');

Page({
  data: {
    userInfo: {
      nickname: '加载中...',
      bio: '',
      avatar: '',
      userIcon: '🧑‍💻',
      fishCount: 0,
      catchCount: 0,
      spotCount: 0,
    },
  },

  onLoad() {
    this.loadUserInfo();
  },

  async loadUserInfo() {
    try {
      // 模拟用户 openid
      const openid = 'test_openid_001';
      const user = await API.getUserInfo(openid);
      this.setData({
        userInfo: {
          nickname: user.nickname || '钓鱼新手',
          bio: user.bio || '',
          avatar: user.avatar || '',
          userIcon: '🧑‍🎣',
          fishCount: user.fish_count || 0,
          catchCount: user.catch_count || 0,
          spotCount: user.spot_count || 0,
        }
      });
    } catch (err) {
      console.error('加载用户信息失败:', err);
    }
  },

  goToMySpots() {
    wx.navigateTo({ url: '/pages/my/spots' });
  },

  goToMyCatches() {
    wx.switchTab({ url: '/pages/catchlog/catchlog' });
  },

  goToMyPosts() {
    wx.navigateTo({ url: '/pages/my/posts' });
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/my/settings' });
  },
});