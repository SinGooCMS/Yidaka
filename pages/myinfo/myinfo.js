var util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    dakaUser: {}, //会员
    hiddenLoading:false,
    hiddenMyInfo:true
  },

  // 初始化设置
  onLoad: function () { //只触发一次    
  },

  onShow:function(){ //每次都会触发，保证读取的会员信息是实时的
    this.getDakaUser();
  },

  getDakaUser:function(){
    var that = this;
    app.getServerUser(function (res) {
      if (res && res.NickName) {
        that.setData({
          hiddenLoading: true,
          hiddenMyInfo: false,
          dakaUser: res
        });
        wx.hideLoading();
      }

      wx.stopPullDownRefresh();

    });
  },

  onPullDownRefresh: function () {
    wx.showLoading({
      title: '请稍候...'
    })

    this.getDakaUser();
  }

})