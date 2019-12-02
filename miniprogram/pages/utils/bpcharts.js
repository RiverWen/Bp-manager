
const charts = bpdata => {
   
    var cate=[]
    var sbp=[],dbp=[]
    for (let i=0 ; i < bpdata.length; i++){
        sbp.unshift(bpdata[i].bp[0])
        dbp.unshift(bpdata[i].bp[1])
        cate.unshift(formatChartsDate(bpdata[i].date))
    }

var wxCharts = require('./wxcharts.js');
return new wxCharts({
    canvasId: 'lineCanvas',
    type: 'line',
    categories:cate,
    series: [{
        name: '收缩压',
        data: sbp,
        format: function (val) {
            return val.toFixed(0) ;
        }
    }, {
         name: '舒张压',
        data: dbp,
        format: function (val) {
            return val.toFixed(0) ;
        }
    }],
    yAxis: {
        title: '血压 (mmHg)',
        format: function (val) {
            return val.toFixed(0);
        },
        min: 50,
        max:200
    },
    width: 375,
    height: 300
});

}
// 将时间戳转为一个二维数组:[[日期，时间],[日期，时间]...]
const formatChartsDate = date =>{
    let chartDate=[],f='',g=''
    chartDate.push(date.getMonth()+1 +'-' + date.getDate())
    if( date.getMinutes()<=9){f='0'}
    if( date.getHours() <=9 ){g='0'}
    chartDate.push(g + date.getHours() + ':' + f + date.getMinutes())
    return chartDate
}

module.exports={
    charts: charts
} 