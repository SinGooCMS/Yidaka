/**
 * App() 函数
 * 
 * 用来注册一个小程序。接受一个 object 参数，其指定小程序的生命周期函数等。
 * 
 * @param onLaunch // 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
 * @param onShow   // 当小程序启动，或从后台进入前台显示，会触发 onShow
 * @param onHide   // 当小程序从前台进入后台，会触发 onHide
 *  
 */

App({

	onLaunch: function() {    
		console.log('APP-onLaunch 生命周期函数--监听小程序初始化');    
	},

	onShow: function() {
		console.log('App-onShow 生命周期函数--监听小程序显示');   
    
    var that = this;
    wx.getSystemInfo({
      success(res) {
        that.globalData.phoneBrand = res.brand; //手机品牌
        that.globalData.phoneModel = res.model; //手机型号
      }
    });
	},

	onHide: function() {
		console.log('App-onHide 生命周期函数--监听小程序隐藏');
	},

  //获取微信用户信息
	getUserInfo: function(cb) {
		var that = this;    
		if (this.globalData.userInfo.nickName) {
			typeof cb == "function" && cb(this.globalData.userInfo)
		} else {
			//调用登录接口
			wx.login({
				success: function(r) {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              console.log("用户昵称：" + res.userInfo.nickName);
              typeof cb == "function" && cb(res.userInfo)
            },
            fail: function (r) { //第一次要用户授权，否则默认调用失败
              console.log("将跳转到用户授权页");
              if (wx.canIUse('button.open-type.getUserInfo'))
                wx.redirectTo({ url: "/pages/authorize/authorize" });
              else
                wx.showToast({ title: '不支持 button.open-type.getUserInfo', icon: "none" });
            }
          });
				}        
			})
		}
	},

  //code换取openId
  getOpenId:function(fun){
    var that = this;
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        that.globalData.openId=res.data;
        typeof fun == "function" && fun(res.data)
      },
      fail:function(){
        wx.login({
          success: function (r) {
            //获取用户openid
            wx.request({
              url: that.globalData.remoteServer + "GetOpenId",
              data: {
                'code': r.code
              },
              method: 'GET',
              success: function (res) {
                that.globalData.openId = res.data.openid;
                wx.setStorage({
                  key: 'openid',
                  data: res.data.openid,
                })
                typeof fun == "function" && fun(res.data.openid)
              }
            });
          }
        });
      }
    });    
  },

  //根据openId获取用户信息(openId作为用户名，唯一的)
  getServerUser: function (fun){
    var that = this;
    this.getOpenId(function(res){
      if(res){
        wx.request({
          url: that.globalData.remoteServer + "GetUserInfo",
          data: {
            'openId': that.globalData.openId
          },
          method: 'GET',
          success: function (res) {
            console.log('登录会员手机：' + res.data.Mobile);
            //通过openid去查询会员，没有则注册，并等待管理员审核
            if (res.data.Mobile == null) {
              wx.redirectTo({ url: "/pages/register/register" });
            } else {
              that.globalData.dakaUser = res.data;
              typeof fun == "function" && fun(res.data)
            }
          }
        });
      }
    });
  }, 

  //判断wifi是否打开并连接上
  isWifiConnected: function(fun){
    var that = this;
    wx.getSystemInfo({
      success(res) {
        if (res.wifiEnabled) {
          wx.startWifi({
            success: () => {
              wx.getConnectedWifi({
                success: res => {
                  if (res.wifi.SSID == that.globalData.companyWifiSSID && res.wifi.BSSID == that.globalData.companyWifiBSSID) {
                    //console.log("已经连接上了公司的wifi");
                    typeof fun == "function" && fun(true,true)
                  }
                },
                fail: err => {
                  console.log(err)
                  typeof fun == "function" && fun(true,false)
                }
              })
            },
          });
        }else{
          wx.showToast({
            title: 'Wifi开关未打开！',
            icon:'none'
          })
        }
      }
    });
  },

	globalData: {
    remoteServer:"https://weiapp.ue.net.cn/weixinapi/", //服务端地址
		userInfo: {}, //微信用户
		openId: '',
    dakaUser: {}, //企业用户（员工）
    phoneBrand: '', //手机品牌
    phoneModel: '', //手机型号    
    companyWifiSSID: "TP-LINK_9DE4", //公司wifi名字，用户判断用户是否在公司范围内，如果用定位，误差比较大。在公司楼下就打卡了
    companyWifiBSSID: "14:75:90:29:9d:e4" //公司wifi的mac地址，打开路由器管理可以查看到
	},

  "permission": {
　　"scope.userLocation": {
  　　　　"desc": "你的位置信息将用于小程序位置接口的效果展示"
　　}
  }

})