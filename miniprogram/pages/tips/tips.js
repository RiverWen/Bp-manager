// pages/tips/tips.js
const db= wx.cloud.database()
const message= db.collection('message')
const app=getApp()
import Toast from 'vant-weapp/toast/toast'
Page({

  /**
   * 页面的初始数据
   */
  data: {
      contrlPage: false,
      help:[
          { step: '01', title: '调整滑块', text:'滑动设置滑块，调整至您测得的血压读数。',src:'../../images/i1.png'},
          { step: '02', title: '一键记录', text:'点击一键记录按钮，保存记录。',src:'../../images/i2.png'},
          { step: '03', title: '生成报告', text:'点击生成报告按钮，将报告存入您的手机相册，即可分享给您的医生。',src:'../../images/i3.png'}
      ],
      activeNames: ['3'],
      messageList:[],
      prePage:10,
      starValue: 0
  },

onChange(event) {
    this.setData({
        activeNames: event.detail
    });
},
onStarChange(e){
    this.setData({
        starValue: e.detail
    });
},
starSubmit:function(event){
    message.where({
        _openid:app.globalData.openid,
        name: 'star'
    })
    .count()
    .then(res=>{
        if(res.total==0){
            message.add({
                data:{
                    name:'star',
                    star: this.data.starValue
                }
            }).then(res=>{
                //写入评价完成
                Toast('感谢您的评价！')
                this.setData({
                    starValue:0,
                    activeNames: []
                })
            }).catch(err =>{console.log(err)})
        }else{
            wx.cloud.callFunction({
                name: 'update',
                data: {
                    star: this.data.starValue
                }
            }).then(res=>{
                //更新评价完成
                Toast('感谢您的评价！')
                this.setData({
                    starValue: 0,
                    activeNames: []
                })
            }).catch(err => { console.log(err) })
        }

    }).catch(err =>{console.log(err)})

},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if (app.globalData.openid == 'oYqEF5no7Fq9vm6GqTkfDChkw0Sk') { 
          this.setData({ contrlPage: true, activeNames: [] }) }
      this.getAllMessage()
  },

  async getAllMessage() {
      let count=await this.countMessage() 
      var batchTimes = Math.ceil(count / this.data.prePage)
      var messageList=[]
      for(let i=0; i<batchTimes; i++){
          var promise= await this.getMessage(batchTimes,i)
          messageList= messageList.concat(promise)
      }
      this.setData({messageList:messageList})

  },
  getMessage:function(batchTimes,i){
      var that=this
      return new Promise(function(resolve,reject){
          message.where({
              show:true
          }).orderBy('date','asc')
          .limit(that.data.prePage)
          .skip(i*batchTimes)
          .get()
          .then(res=>{
              resolve(res.data)
          })
          .catch(err =>{reject(err)})
      })
  },

  countMessage: function(){
      return new Promise(function(resolve,reject){
          message.where({
              show:true
          }).count().then(res=>{
              resolve(res.total)
          }).catch(err =>{reject(err)})
      })
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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

  },
    enter: function (e) {
        wx.navigateTo({
            url: '../contrl/contrl'
        })
    }
})