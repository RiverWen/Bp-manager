// pages/user/user.js
const db = wx.cloud.database()
const bprecorder = db.collection('bprecorder')
const userinfo = db.collection('userinfo')
const app = getApp()
import Toast from 'vant-weapp/toast/toast'
Page({

      /**
       * 页面的初始数据
       */
      data: {
        openid: '',
        waterfall: false,//空数据填充开关
        sbpActiveColor: '#1aad19',
        dbpActiveColor: '#1aad19',
        plusActiveColor: '#1aad19',
        bp: [120, 80, 60],
        bplist: [],
        intervalTitle: '距离上次记录',
        intervalString: '',
        show: false, //vant弹窗开关
        currentId: '',
        count:0

      },

      /**
       * 生命周期函数--监听页面加载
       */
onLoad: function(options) {
    
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称
        wx.cloud.callFunction({
            name: 'getopenid'
        }).then(res => {
            var openid = res.result.openid
            app.globalData.openid = openid
            userinfo.where({
                _openid: openid
            }).count().then(res2 => {
                if (res2.total == 0) {
                    //后台注册
                    wx.getUserInfo({
                        success: res3 =>{
                            userinfo.add({
                                data: res3.userInfo,
                                success: res=>{
                                    console.log('1 userinfo writed')
                                    },
                                fail: err => {console.error(err)}
                            })
                        },
                        fail: err=>{console.error(err)}
                    })
                }else{
                //用户已注册，app.globalData.openid已赋值，
                // console.log(app.globalData.openid)
                bprecorder.where({_openid:app.globalData.openid})
                .count({
                    success: res =>{
                        this.setData({count:res.total})
                        if(res.total==0){
                            this.setData({
                                waterfall: true,
                                bpList:[],
                                intervalTitle:'暂无记录'
                            })
                        }else{
                            this.creatList()
                            this.interval()
                            var that=this
                            if(setInter != null){clearInterval(setInter)} 
                            var setInter = setInterval(function(){that.interval()},1*60*1000)
                            this.data.setInter = setInter
                        }
                    },
                    fail: err =>{console.error(err)}
                })
                }
            }).catch(err=>{console.error(err)})
        })
    
    

},


addRecorder: function(e) {

    var date = new Date()
    var recorder = this.data.bp
    if (this.data.count == 0) {
        //toast
        Toast('记录中...')
        bprecorder.add({
        data: {
            bp: recorder,
            date: date
        }
        }).then(res => {
        //写入成功 渲染列表 结束toast--------
        this.setData({
            intervalTitle: '距离上次记录'
        })
        this.onLoad()
        Toast.clear
        })
    } else {
        //取得最近一次记录的时间，与现在对比小于1分钟就不写入数据，大于1分钟就写入，后刷新列表
        bprecorder.where({
            _openid: this.data.openid
        }).orderBy('date', 'desc')
        .limit(1)
        .field({
            date: true
        })
        .get().then(res => {
            var lastDate = res.data[0].date
            if (date - lastDate < 60000) {
            Toast('请勿频繁记录')
            } else {
            Toast('记录中...')
            bprecorder.add({
                data: {
                bp: this.data.bp,
                date: date
                }
            }).then(res => {
                //记录写入成功，渲染列表，结束toast---------------------------
                this.data.count++
                //delete一条最早的记录，每用户只保留99条。
                if(this.data.count >= 100){
                    bprecorder.where({_openid:this.data.openid})
                    .orderBy('date','asc')
                    .limit(1)
                    .remove()
                    .then (res=>{})
                    .catch(err=>{console.log(err)})
                }
                this.creatList()
                this.interval()
                Toast.clear()
            })
            }

        }).catch(err => {
            console.error(err)
        })
    }
},

    //距离上次记录的时间间隔
    interval: function() {
    bprecorder.where({
        _openid: app.globalData.openid
        })
        .field({
        date: true
        })
        .limit(1)
        .orderBy('date', 'desc')
        .get()
        .then(res => {
        var inter = new Date() - res.data[0].date
        if (inter < 60 * 1000) {
            this.setData({
            intervalString: '不到 1 分钟'
            })
        } else if (inter < 60 * 60 * 1000) {
            this.setData({
            intervalString: Math.floor(inter / 60 / 1000) + '分钟'
            })
        } else if (inter < 24 * 60 * 60 * 1000) {
            let h = Math.floor(inter / 60 / 60 / 1000)
            let y = inter - (h * 60 * 60 * 1000)
            let m = Math.floor(y / 60 / 1000)
            this.setData({
            intervalString: h + '小时' + m + '分'
            })
        } else {
            let d = Math.floor(inter / 24 / 60 / 60 / 1000)
            let y = inter - (d * 24 * 60 * 60 * 1000)
            let h = Math.floor(y / 60 / 60 / 1000)
            this.setData({
            intervalString: d + '天' + h + '小时'
            })
        }
        })
    },

    //弹窗，标记当前ID
    longpress: function(e) {
    this.setData({
        currentId: e.currentTarget.dataset.id,
        show: true
    })
    },

    //关闭弹窗
    onClose: function(e) {
    this.setData({
        show: false
    })
    },

    //删除一条记录
    deleteRecord: function(e) {
    this.onClose()
    Toast('正在删除...')
    bprecorder.doc(this.data.currentId).remove()
        .then(res => {
        Toast.clear()
        Toast('删除成功')
        this.data.count--
            if (this.data.count == 0) {
            clearInterval(this.data.setInter)
            this.setData({
                intervalTitle: '暂无记录',
                intervalString: '',
                bplist:[]
            })
            this.onLoad()
            Toast.clear()
            } else {
            this.creatList()
            this.interval()
            Toast.clear()
            }
        }).catch(err => {
        console.error(err)
        })
    },

    //组装数据，并渲染
    creatList: function(e) {
    bprecorder.where({
        _openid: this.data.openid
        })
        .field({
        bp: true,
        date: true
        })
        .orderBy('date', 'desc')
        .limit(20)
        .get().then(res3 => {
        var bplist = res3.data.map(this.formatList)
        this.setData({
            bplist: bplist,
            waterfall: false
        })
        })
    },
    //记录展示区的时间字串
    formatList: function(v) {
    var y = v.date.getFullYear()
    var m = v.date.getMonth() + 1
    var d = v.date.getDate()
    var h = v.date.getHours()
    var i = v.date.getMinutes()
    if (i <= 9) {
        i = '0' + i
    }
    if (h <=9 ){ h= '0' + h}
    var formatDate = {
        fd: y + '年' + m + '月' + d + '日',
        ft: h + ':' + i
    }
    Object.assign(formatDate, v)
    return formatDate
    },

    //slider轨道变色
    sbpSliderChange: function(e) {
    var value = e.detail.value
    this.data.bp[0] = value
    if (90 < value && value < 139) {
        this.setData({
        sbpActiveColor: '#1aad19'
        })
    } else {
        this.setData({
        sbpActiveColor: '#ff1710'
        })
    }
    },
    dbpSliderChange: function(e) {
    var value = e.detail.value
    this.data.bp[1] = value
    if (60 < value && value < 89) {
        this.setData({
        dbpActiveColor: '#1aad19'
        })
    } else {
        this.setData({
        dbpActiveColor: '#ff1710'
        })
    }
    },
    pulsSliderChange: function(e) {
    let value = e.detail.value
    this.data.bp[2] = value
    if (60 < value && value < 100) {
        this.setData({
        pulsActiveColor: '#1aad19'
        })
    } else {
        this.setData({
        pulsActiveColor: '#ff1710'
        })
    }
    },
    send: function(e) {
    console.log('send')
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
    this.setData({
        active: 0
    })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})