var util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    currTime: '', //当前时间（显示时钟）
    weekday:'', //日期+星期几

    openId: '',
    dakaUser: {}, //打卡的用户，未审核的用户不能打卡
    dakaSet: {}, //服务端的打卡设置

    showText: '',

    // 打卡按钮状态 0:未按压 1：按压 2：完成 -1:不可用
    btnState: -1, //默认不可用
    btnPress: false,

    hiddenLoading: false,
    hiddenMyInfo: true
  },

  // 签到打卡
  signTask: function () {
    var that = this;

    app.isWifiConnected(function (res1, res2) {
      var isWifiOpen = res1; //wifi是否打开了
      var isAtCompany = res2; //是否已到了公司，打卡先决条件

      console.log("参数：在公司：" + isAtCompany + " | 用户状态：" + that.data.dakaUser.Status + " | 签到状态：" + that.data.dakaSet.hasSigned)
      if (!isWifiOpen) {
        wx.showToast({ title: 'Wifi开关未打开！', icon: "none" })
      } else if (!isAtCompany) {
        wx.showToast({ title: '请到公司再打卡！', icon: "none" })
      } else if (that.data.dakaUser.Status == "待审核") {
        wx.showToast({ title: '用户待审核', icon: "none" })
      } else if (that.data.dakaSet.isSignTime=="False") {
        wx.showToast({ title: '非打卡时间内', icon: "none" })
      } else if (that.data.dakaSet.hasSigned=="True") {
        wx.showToast({ title: '已经签到！', icon: "none" })
      } else {
        wx.showToast({
          title: '请求中',
          icon: 'loading',
          duration: 1000
        })

        that.setData({
          'btnState': 1, //按钮下的状态（显示不同的图片）
          'btnPress': true
        });

        setTimeout(function () {
          that.setData({
            'btn': 1,
            'btnPress': false
          });
        }, 500);

        wx.request({
          url: app.globalData.remoteServer + "DaKa",
          data: {
            openId: that.data.dakaUser.UserName
          },
          method: 'POST',
          success: function (res) {
            if (res.data != null && res.data.ret == "success") {
              wx.showToast({ title: '打卡成功！' });
              that.setData({
                //canCurrSign: false,
                btnState: 2
              });
              that.getDakaSet();
            } else {
              wx.showToast({ title: '打卡失败，请联系管理员！', icon: "none" })
            }
          },
          fail: function () {
            wx.showToast({ title: '打卡失败，请联系管理员！', icon: "none" })
          }
        });
      }

    });    

  },

  onReady: function () {    
  },

  // 初始化
  onLoad: function () {    
    this.showTimer();
  },

  // 监听页面显示
  onShow: function () {      
    this.getDakaSet();
  },

  getDakaSet:function(fun){
    var that = this;
    app.getServerUser(function (res) {
      that.data.dakaUser = res; //打卡的执行人＝用户
      //从服务器获取打卡时间设置
      wx.request({
        url: app.globalData.remoteServer + "GetDakaSet",
        method: 'GET',
        data: {
          openId: res.UserName
        },
        success: function (res) {
          console.log('打卡时间：' + res.data.signDesc);

          if (res.data) {
            var dataTxt = res.data.signDesc;            
            if (res.data.hasSigned == "True")
              dataTxt = res.data.signDesc + " " + res.data.hasSignedTime; //已签到时间
            else if (res.data.isSignTime == "True")
              dataTxt = res.data.signDesc + " " + res.data.signTime; //加上打卡时间

            that.setData({
              dakaSet: res.data,
              btnState: res.data.isSignTime=="False" ? -1 : (res.data.hasSigned=="True" ? 2 : 0), //-1非签到时间 0可打卡 2已打卡
              showText: dataTxt,
              weekday: res.data.weekdayFull,
              hiddenLoading: true,
              hiddenMyInfo: false,
            });

          }

        },
        fail: function () {
          wx.showToast({ title: '获取数据失败', icon: "none" })
        },
        complete:function(){
          wx.hideLoading();
          wx.stopPullDownRefresh();
        }
      })
    }); 
  },

  //显示时钟
  showTimer:function(){
    var that = this;
    var d = setInterval(function () {
      var TIME = util.formatTime(new Date());
      that.setData({
        currTime: TIME.substring(10) //只要时分秒
      });
    }, 1000);
  },

  onPullDownRefresh: function () {
    wx.showLoading({
      title: '请稍候...'
    })
    this.getDakaSet();
  }

});