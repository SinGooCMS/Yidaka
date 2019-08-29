var util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false, //是否用户已授权读取个人信息
    canIUser: wx.canIUse('button.open-type.getUserInfo')
  },

  // 初始化设置
  onLoad: function () {    
  },

  onShow:function(){
    var that=this;
    app.getUserInfo(function(userinfo){      
      if (userinfo){
        that.setData({
          userInfo: userinfo,
          hasUserInfo: true
        });
      }
    });
  },

  bindSubmit:function(e){
    var that=this;

    var mobile = e.detail.value.Mobile;
    var realName = e.detail.value.RealName;
    if (realName == "") wx.showToast({ title: "真实姓名不为空", icon: "none" });
    else if (mobile == "") wx.showToast({ title: "手机不为空", icon:"none"});
    else if (mobile.length!=11) wx.showToast({title:"请输入11位手机号码",icon:"none"});
    else{
        
      wx.request({
        url: app.globalData.remoteServer + "RegUser",
        data: {
          'openId': app.globalData.openId,
          'Mobile': mobile,
          'RealName': realName,
          'NickName': that.data.userInfo.nickName,
          'Gender': that.data.userInfo.gender==2?"女":"男", //0未知1男2女
          'HeaderPhoto': that.data.userInfo.avatarUrl,
          'PhoneBrand': app.globalData.phoneBrand,
          'PhoneModel': app.globalData.phoneModel,
          "Department": e.detail.value.Department,
          "Job": e.detail.value.Job,
          "temp":Math.random()
        },
        method: 'POST',
        success: function (res) {
          if(res.data!=null && res.data.ret=="success"){
            wx.showToast({
              title:'注册成功！',
              success:function(){
                wx.switchTab({
                  url: "../myinfo/myinfo"
                })
              }
            });
          }else{
            wx.showToast({
              title: '注册失败:'+res.data.msg,
              icon:"none"
            });
          }
        }
      });
      
    }
  }
})