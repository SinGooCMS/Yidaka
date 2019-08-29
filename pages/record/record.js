var util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    openId: '',

    signNormal: 0,       //准时签到次数
    signLate: 0,         //迟到次数
    somethingLeave: 0,   //请假次数
    sickLeave: 0,        //病假次数    
    absent: 0,        //旷工次数

    startDay: '', //查询的起始日期  yyyy-MM-dd
    endDay: '', //查询结束日期 yyyy-MM-dd
    recordList: [], //打卡记录列表

    isKaoqinStatOk:false, //考勤统计加载完成
    isKaoqinListOk:false, //考勤列表加载完成
    hiddenLoading: false,
    hiddenMyInfo: true,

    pageIndex:1,
    pageSize:30,
    totalPage:1
  },

  // 查询开始日期
  sStartDateChange: function (e) {
    var d = this.data;

    this.setData({
      startDay: e.detail.value
    })

    this.loadPagerData(d.startDay, d.endDay, 1);
  },

  // 个人查询结束日期
  sEndDateChange: function (e) {
    var d = this.data;

    this.setData({
      endDay: e.detail.value
    })

    this.loadPagerData(d.startDay,d.endDay,1);
  },

  onLoad: function () {
    //  
  },

  onShow:function(){
    var that = this;
    var now = new Date();
    var d = this.data;

    this.setData({
      startDay: util.getFirstDayOfWeek(new Date()), //默认的一周的第一天
      endDay: util.getLastDayOfWeek(new Date()) //默认一周的最后一天
    })

    app.getOpenId(function (res) {
      that.data.openId = res;
      that.loadPagerData(d.startDay, d.endDay, 1);
    });  
  },

  onReachBottom:function(){
    wx.showLoading({
      title: '请稍候...'
    })

    if((this.data.pageIndex+1) > this.data.totalPage){
      wx.showToast({
        title: '没有更多数据了',
        duration:2000,
        success:function(){
          //wx.hideLoading();
        }
      })
    }else{
      var d = this.data;
      this.data.pageIndex++;
      this.loadPagerData(d.startDay, d.endDay);
    }    
  },

  onPullDownRefresh:function(){
    wx.showLoading({
      title: '请稍候...'
    })

    var d = this.data;
    this.data.pageIndex=1;
    this.loadPagerData(d.startDay,d.endDay);
  },

  //加载分页数据
  loadPagerData: function (startDay, endDay){
    var that=this;
    console.log("参数："+startDay+" | "+endDay+" | "+this.data.pageIndex+" | 30")
    wx.request({
      url: app.globalData.remoteServer + "GetRecordList",
      data: {
        openid: that.data.openId,
        datestart: startDay,
        dateend: endDay,
        page: that.data.pageIndex,
        size: that.data.pageSize
      },
      method: 'GET',
      success: function (res) {
        var d = res.data.data;
        //console.log(d);
        if(d){
          that.setData({
            recordList: d,
            signNormal: res.data.stat.NormalNum,
            signLate: res.data.stat.LateNum,
            somethingLeave: res.data.stat.LeaveNum,
            sickLeave: res.data.stat.SickNum,
            absent: res.data.stat.AbsentNum,
            totalPage: res.data.pager.totalPage,
            hiddenLoading: true,
            hiddenMyInfo: false
          })
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      },
      complete:function(){        
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    })
  }
})