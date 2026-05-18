// API 配置文件
const API_BASE = 'http://172.26.151.122:3000';
const REQUEST_TIMEOUT = 8000;

function request(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error('timeout'));
    }, REQUEST_TIMEOUT);

    wx.request({
      url: API_BASE + url,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success(res) {
        clearTimeout(timer);
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(res.data.msg || '请求失败');
        }
      },
      fail(err) {
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

const API = {
  getSpots: (params) => request('/api/spots/list', 'GET', params),
  getSpotDetail: (id) => request(`/api/spots/detail/${id}`),
  addSpot: (data) => request('/api/spots/add', 'POST', data),
  getCatchLogs: (params) => request('/api/catch/list', 'GET', params),
  publishCatch: (data) => request('/api/catch/publish', 'POST', data),
  getFishBook: (userId) => request(`/api/catch/fishbook/${userId}`),
  getPosts: (params) => request('/api/community/list', 'GET', params),
  publishPost: (data) => request('/api/community/publish', 'POST', data),
  getPostDetail: (postId) => request(`/api/community/detail/${postId}`),
  likePost: (postId, userId) => request(`/api/community/like/${postId}`, 'POST', { user_id: userId }),
  getPostLikeStatus: (postId, userId) => request(`/api/community/like/status/${postId}?user_id=${userId}`),
  getComments: (postId, page) => request(`/api/community/comments/${postId}?page=${page || 1}&limit=20`),
  comment: (data) => request('/api/community/comment', 'POST', data),
  likeComment: (commentId, userId) => request(`/api/community/comment/like/${commentId}`, 'POST', { user_id: userId }),
  getSpotReviews: (spotId, page) => request(`/api/spots/reviews/${spotId}?page=${page}&limit=10`),
  addSpotReview: (data) => request('/api/spots/review/add', 'POST', data),
  getUserInfo: (openid) => request(`/api/user/info/${openid}`),
  getWeather: (city) => request(`/api/weather/current?city=${encodeURIComponent(city)}`),
};

module.exports = { API, API_BASE };