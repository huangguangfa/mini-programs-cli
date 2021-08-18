
//Date对象日期格式化
Date.prototype.format = function(format, weekType) {
    let dayNames = null;

    // 中文几天前后
    let dayAgo = '';
    // 今天
    let td = new Date();
    td = new Date(td.getFullYear(), td.getMonth(), td.getDate());

    // 传进来的时间
    let od = new Date(this.getFullYear(), this.getMonth(), this.getDate());

    let xc = (od - td) / 1000 / 60 / 60 / 24;

    if(xc < -2){
        dayAgo = -xc + "天前";
    }else if(xc < -1){
        dayAgo = "前天";
    }else if(xc < 0){
        dayAgo = "昨天";
    }else if(xc === 0){
        dayAgo = "今天";
    }else if(xc < 2){
        dayAgo = "明天";
    }else if(xc < 3){
        dayAgo = "后天";
    }else{
        dayAgo = xc + "天后";
    }

    if (weekType === "smallWeek") {
        dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    } else {
        dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    }
    let o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        S: this.getMilliseconds(), // 毫秒
        W: dayNames[this.getDay()], //星期
        w: this.getDay(), //星期
        A: dayAgo
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
            );
    return format;
};