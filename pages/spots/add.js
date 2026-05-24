const { API } = require('../../utils/api.js');

const types = [
  { key: 'wild', label: '野钓', icon: '🏞️', color: '#4a9c6d' },
  { key: 'pond', label: '塘钓', icon: '🎣', color: '#8b7355' },
  { key: 'lure', label: '路亚', icon: '🌊', color: '#2d5a87' },
  { key: 'boat', label: '船钓', icon: '🚤', color: '#5d8aa8' },
];

const priceOptions = ['免费', '10元/小时', '20元/小时', '50元/天', '100元/天', '其他'];
const baitOptions = ['蚯蚓', '商品饵', '玉米', '虾', '小鱼', '米诺', '亮片', '其他'];
const openHoursOptions = ['全天', '06:00-18:00', '08:00-17:00', '24小时', '其他'];

Page({
  data: {
    types,
    formData: {
      name: '',
      type: 'wild',
      address: '',
      fish_types: '',
      bait: '',
      open_hours: '',
      price: '',
      latitude: '',
      longitude: '',
      tags: '',
    },
    selectedTags: [],
    submitting: false,
  },

  onLoad() {
    // 默认选择野钓
    this.setData({ 'formData.type': 'wild' });
  },

  onTypeTap(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 'formData.type': type });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  onGetLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          'formData.latitude': String(res.latitude),
          'formData.longitude': String(res.longitude),
        });
        wx.showToast({ title: '定位成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '定位失败，请在地图选择', icon: 'none' });
      }
    });
  },

  onTagToggle(e) {
    const tag = e.currentTarget.dataset.tag;
    const selected = [...this.data.selectedTags];
    const idx = selected.indexOf(tag);
    if (idx === -1) {
      if (selected.length < 5) selected.push(tag);
    } else {
      selected.splice(idx, 1);
    }
    this.setData({ selectedTags: selected });
    this.setData({ 'formData.tags': selected.join(',') });
  },

  onPriceChange(e) {
    const idx = e.detail.value;
    this.setData({ 'formData.price': priceOptions[idx] });
  },

  onSubmit() {
    const { name, type, address } = this.data.formData;
    if (!name.trim()) return wx.showToast({ title: '请输入钓点名称', icon: 'none' });
    if (!address.trim()) return wx.showToast({ title: '请输入地址', icon: 'none' });

    this.setData({ submitting: true });
    API.addSpot(this.data.formData).then(() => {
      wx.showToast({ title: '添加成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }).catch(err => {
      wx.showToast({ title: err.message || '添加失败', icon: 'none' });
      this.setData({ submitting: false });
    });
  },
});