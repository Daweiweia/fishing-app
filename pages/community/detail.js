const app = getApp();
const { API } = require('../../utils/api.js');

function getUserId() {
  return app.globalData.openid || wx.getStorageSync('openid') || '';
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hour}:${min}`;
}

Page({
  data: {
    postId: null,
    post: null,
    comments: [],
    commentPage: 1,
    hasMoreComments: true,
    commentLoading: false,
    commentText: '',
    replyToComment: null, // 回复目标评论
    replyText: '',
  },

  onLoad(options) {
    const { id } = options;
    if (!id) return wx.navigateBack();
    this.setData({ postId: parseInt(id) });
    this.loadPostDetail();
    this.loadComments();
  },

  loadPostDetail() {
    API.getPostDetail(this.data.postId).then(res => {
      const post = res.post;
      this.setData({
        post: {
          ...post,
          images: post.images || [],
          userIcon: post.author_avatar ? '' : '🧑‍🎣',
          timeAgo: this.formatTimeAgo(post.created_at),
        }
      });
    }).catch(err => {
      console.error('加载帖子详情失败:', err);
    });
  },

  loadComments(append = false) {
    const { commentPage, commentLoading, hasMoreComments, postId } = this.data;
    if (commentLoading || (!append && !hasMoreComments)) return;

    this.setData({ commentLoading: true });
    const page = append ? commentPage + 1 : 1;

    API.getComments(postId, page).then(res => {
      const list = (res || []).map(c => ({
        ...c,
        userIcon: c.author_avatar ? '' : '🧑‍🎣',
        created_at: formatTime(c.created_at),
        replies: (c.replies || []).map(r => ({
          ...r,
          userIcon: r.author_avatar ? '' : '🧑‍🎣',
          created_at: formatTime(r.created_at),
        })),
      }));
      this.setData({
        comments: append ? this.data.comments.concat(list) : list,
        commentPage: page,
        hasMoreComments: list.length >= 20,
        commentLoading: false,
      });
    }).catch(() => {
      this.setData({ commentLoading: false });
    });
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  onReplyInput(e) {
    this.setData({ replyText: e.detail.value });
  },

  onSubmitComment() {
    const { postId, commentText } = this.data;
    if (!commentText || commentText.trim().length < 2) {
      wx.showToast({ title: '评论至少2个字', icon: 'none' });
      return;
    }
    API.comment({
      post_id: postId,
      user_id: getUserId(),
      content: commentText,
    }).then(() => {
      wx.showToast({ title: '评论成功', icon: 'success' });
      this.setData({ commentText: '', commentPage: 1, hasMoreComments: true });
      this.loadComments();
    }).catch(err => {
      wx.showToast({ title: err.message || '评论失败', icon: 'none' });
    });
  },

  onReplyComment(e) {
    const comment = e.currentTarget.dataset.comment;
    this.setData({
      replyToComment: comment,
      replyText: '',
    });
  },

  onCancelReply() {
    this.setData({ replyToComment: null, replyText: '' });
  },

  onSubmitReply() {
    const { postId, replyToComment, replyText } = this.data;
    if (!replyText || replyText.trim().length < 2) {
      wx.showToast({ title: '回复至少2个字', icon: 'none' });
      return;
    }
    API.comment({
      post_id: postId,
      user_id: getUserId(),
      content: replyText,
      parent_id: replyToComment.id,
      reply_to_name: replyToComment.author_name || '匿名用户',
    }).then(() => {
      wx.showToast({ title: '回复成功', icon: 'success' });
      this.setData({ replyToComment: null, replyText: '' });
      this.loadComments();
    }).catch(err => {
      wx.showToast({ title: err.message || '回复失败', icon: 'none' });
    });
  },

  onLikeComment(e) {
    const commentId = e.currentTarget.dataset.id;
    API.likeComment(commentId, getUserId()).then(() => {
      this.loadComments();
    }).catch(err => {
      wx.showToast({ title: err.message || '点赞失败', icon: 'none' });
    });
  },

  onScrollToLower() {
    this.loadComments(true);
  },

  onBack() {
    wx.navigateBack();
  },

  formatTimeAgo(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
  },
});