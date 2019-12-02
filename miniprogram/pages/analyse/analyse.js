
import regeneratorRuntime from '../utils/runtime.js'//优雅处理async
import Toast from '../../vant-weapp/toast/toast.js';

const app=getApp()
const db=wx.cloud.database()
const bprecorder= db.collection('bprecorder')
var bpcharts= require('../utils/bpcharts.js')
var reportPic= require('../utils/reportPic.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
      count: 0,
      bpList: []
  },

getBpCharts: function(option){
    bprecorder.where({
        _openid: app.globalData.openid
    }).field({
        bp: true,
        date: true
    }).orderBy('date','desc')
    .limit(6).get({
        success: res=>{
            // console.log(res.data)
            bpcharts.charts(res.data)
        },
        fail: err=>{console.error(err)}
    })
},

animationNum:function(sta){
    var that=this
    var ani= setInterval(function(){that.dida(ani,sta)},50)
},
dida: function(ani,sta){
    this.setData({
        sbpmax: sta.sbpmax - app.globalData.jump,
        sbpmin: sta.sbpmin - app.globalData.jump,
        dbpmax: sta.dbpmax - app.globalData.jump,
        dbpmin: sta.dbpmin - app.globalData.jump
    })
    app.globalData.jump--
    if(app.globalData.jump < 0){
        clearInterval(ani)
        app.globalData.jump=25
        }
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

hideMask: function(){
    var that= this
    Toast.clear()
    this.setData({isMask:false})
    setTimeout(function(){that.setData({flag:false})},200)
},
showMask: function(){
    this.setData({
        flag:true,
        isMask:true
    })
    Toast.loading({
        duration: 0, 
        zindex: 99999,
        mask: true,
        message: '加载中...'
    });
    
},

catchtap: function(){
    // console.log('catchtap')
},


getCanvasTempPath: function (canvasid,fileType) {
    return new Promise(function (resolve, reject) {
        wx.canvasToTempFilePath({
            canvasId: canvasid,
            fileType: fileType,
            success: function (res) {
                var tempFilePath = res.tempFilePath;
                resolve(tempFilePath) 
            },
            fail: function (res) {
                console.log(res);
            }
        });
    })
},
delay: function(time){
    return new Promise(function(resolve,reject) {
        setTimeout(function(){
            resolve('delay done')
        },time)
    })
},

saveReport: function(){
    console.log(this.data.srcR)
    wx.saveImageToPhotosAlbum({
        filePath: this.data.srcR,
        success: res=>{
            Toast('保存成功！')
            this.hideMask()
        }
    })
},

async creatReportPic(event){
    if(this.data.count >= 3){
    this.showMask()
    let chartsTempPath = await this.getCanvasTempPath('lineCanvas','png')
    let drawReport = await reportPic.reportPic(chartsTempPath,this.data)
    let delay = await this.delay(200)
    let reportTempPath = await this.getCanvasTempPath('report','png')
    this.setData({
        srcR: reportTempPath,
    })
    }else{
        this.setData({transFlag:true})
        await this.delay(2800)
        this.setData({transFlag:false})
    }
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
onReady: function () {

},

  /**
   * 生命周期函数--监听页面显示
   */
onShow: function () {
      this.getBpCharts()
      bprecorder.where({_openid:app.globalData.openid})
        .count().then(res=>{
            
                if(res.total != 0){
                    //有数据，查询、组装并渲染
                    bprecorder.where({ _openid: app.globalData.openid })
                        .limit(20)
                        .field({ bp: true, date: true })
                        .orderBy('date', 'desc')
                        .get({
                            success: res2 => {
                                var list = this.creatBpList(res2.data)
                                this.setData({
                                    count: res2.data.length,
                                    bpList: list
                                })
                                var statData = this.stat(res2.data)
                                this.animationNum(statData)
                            },
                            fail: err => { console.log(err) }
                        })
                }else{
                    this.setData({count:0})
                }
            }).catch(err =>{console.log(err)})
  },

  creatBpList: function(data){
      let bpList=[]
      for(let i=0; i<data.length; i++){
          let bp = data[i].bp.toString().replace(/,/g , '/')
          let dateString= this.formatDate(data[i].date)
          let isDay = this.isDay(data[i].date)
          let isRed = this.isRed(data[i].bp)
          bpList[i]={bp:bp,date:dateString,isDay:isDay,isRed:isRed}
      }
      return bpList
    },
  formatDate: function(date){
      let y=date.getFullYear()
      let m=date.getMonth() + 1
      let d=date.getDate()
      var h
      date.getHours()<=9? h='0'+date.getHours(): h=date.getHours()
      var i
      date.getMinutes()<=9? i='0' + date.getMinutes(): i=date.getMinutes()
      return y +'年' + m + '月' + d + '日' + ' ' + h + ':' +i
  },
  isDay: function(date){
      let h=date.getHours()
      if( h > 8 && h < 20){return 'day'}else{ return 'night'}
  },
  isRed: function(data){
      if(data[0] > 140 || data[0] < 60 || data[1] > 90 || data[1] < 60){return true}else{return false}
  },

  //统计4个极端值
  stat: function(data){
      let sbp=[],dbp=[]
      for(let i=0 ; i < data.length ; i++){
          sbp.push(data[i].bp[0])
          dbp.push(data[i].bp[1])
      }
      var sta={}
      sta.sbpmax = Math.max.apply(null,sbp)
      sta.sbpmin = Math.min.apply(null,sbp)
      sta.dbpmax = Math.max.apply(null,dbp)
      sta.dbpmin = Math.min.apply(null,dbp)
      return sta
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
      this.hideMask()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})