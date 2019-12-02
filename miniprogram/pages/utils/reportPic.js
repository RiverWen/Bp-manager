
const reportPic =  (tempPath,data) =>{

    var context = wx.createCanvasContext('report');
    var day = '../../images/day.png', night = '../../images/night.png';

    return new Promise(function (resolve, reject) {

        context.setFillStyle('#ffffff')
        context.fillRect(0, 0 , 350, data.count*22+470)

        var startY=28
        context.setTextAlign('center')
        context.setFontSize(16)
        context.setFillStyle('#666666')
        context.fillText('自测血压报告',175,startY)
        context.setFontSize(11)
        context.setFillStyle('#fca104')
    context.fillText('乌贼王子@小程序',175,startY+17)
        context.setFillStyle('#cccccc')
        context.fillRect(125, startY + 3 , 100, 2)

        startY += 15
        firtsLevelTitle(startY, '最新血压数据表', context)

        startY += 30
        context.drawImage(tempPath, 0, startY, 345, 280)
        
        startY += 260
        firtsLevelTitle(startY,'血压数据统计表',context)
        context.setFillStyle('#999999')
        context.setTextAlign('left')
        context.setFontSize(11)
        let tip= '(最近' + data.count +'次）'
        context.fillText(tip, 125, startY + 22)

        startY += 50
        context.setFillStyle('#eeeeee')
        context.fillRect(5,startY,340,1)
        context.setFillStyle('#666666')
        context.setFontSize(13)
        context.fillText('收缩压',15,startY-4)
        context.setFillStyle('#999999')
        context.setFontSize(12)
        context.fillText('最高：', 80, startY - 4)
        context.fillText('mmHg', 152, startY - 4)
        context.fillText('最低：', 220, startY - 4)
        context.fillText('mmHg', 292, startY - 4)
        context.setFontSize(20)
        context.setTextAlign('right')
        context.fillText(data.sbpmax, 151, startY - 4)
        context.fillText(data.sbpmin, 291, startY - 4)

        startY += 25
        context.setTextAlign('left')
        context.setFillStyle('#eeeeee')
        context.fillRect(5,startY,340,1)
        context.setFillStyle('#666666')
        context.setFontSize(13)
        context.fillText('舒张压',15,startY-4)
        context.setFillStyle('#999999')
        context.setFontSize(12)
        context.fillText('最高：', 80, startY - 4)
        context.fillText('mmHg', 152, startY - 4)
        context.fillText('最低：', 220, startY - 4)
        context.fillText('mmHg', 292, startY - 4)
        context.setFontSize(20)
        context.setTextAlign('right')
        context.fillText(data.dbpmax, 151, startY - 4)
        context.fillText(data.dbpmin, 291, startY - 4)
        
        startY += 10
        context.setTextAlign('left')
        firtsLevelTitle(startY, '血压数据列表', context)

        startY += 50
        for( let i=0; i < data.bpList.length; i++){
        data.bpList
        context.setFillStyle('#eeeeee')
        context.fillRect(5, startY, 340, 1)
        if(data.bpList[i].isRed){
            context.arc(12, startY - 9, 3 , 0, 2*Math.PI)
            context.setFillStyle('#f02323')
            context.fill()
        }
        context.setFillStyle('#666666')
        context.setFontSize(13)
        context.fillText(data.bpList[i].bp, 24, startY - 4)
        if(data.bpList[i].isDay=='day'){
            context.drawImage(day, 145, startY - 16, 16,16)
        }else{
            context.drawImage(night, 145, startY - 16, 16,16)
        }
        context.setFillStyle('#999999')
        context.setFontSize(12)
        context.fillText(data.bpList[i].date, 203, startY - 4)
        startY += 22
        }
        context.draw(false, resolve('work done'))
        // setTimeout(function () { context.draw(false, resolve('画好了'))},200)
        
        })
}

const firtsLevelTitle = (startY,title,context) => {
    context.setFillStyle('#2e9c09')
    context.fillRect(5, startY, 5, 25)
    context.setFillStyle('#666666')
    context.setTextAlign('left')
    context.setFontSize(15)
    context.fillText(title, 15, startY + 22)
}

module.exports = {
    reportPic: reportPic
} 