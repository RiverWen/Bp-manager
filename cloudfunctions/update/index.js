// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db= cloud.database()
const message= db.collection('message')
// 云函数入口函数
exports.main = async (event, context) => {
    console.log('cloud',event,context)
    const wxContext = cloud.getWXContext()

     return await message.where({
         _openid: wxContext.OPENID,
         name: 'star'
      }).update({
         data: {
            star:event.star
         }
     })

    
}