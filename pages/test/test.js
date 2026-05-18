Page({
  data: { msg: '待点击' },
  onTap() {
    this.setData({ msg: '点击成功!' });
  },
});