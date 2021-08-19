/*
 * @Author: elvis.lam
 * @Desc: 常用工具类封装
 * @Date: 2020-11-10 17:38:45
 * @Last Modified by: elvis.lam
 * @Last Modified time: 2021-05-12 11:55:44
 */

/**
 * 节流函数
 * @param {Function} fn 回调函数
 * @param {*} wait 等待时间
 */
export const throttle = function (fn, wait = 200) {
    var timer = null;
    return function () {
        var context = this;
        var args = arguments;
        if (!timer) {
            timer = setTimeout(function () {
                fn.apply(context, args);
                timer = null;
            }, wait);
        }
    };
};

/**
 * 防抖函数
 * @param {Function} fn 回调函数
 * @param {*} wait 等待时间
 */
export const debounce = function (fn, wait = 200) {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.apply(context, args);
        }, wait);
    };
};

/**
 * 获取文件后缀名
 * @param {String} url 文件路径或文件名
 */
export const getFileSuffix = (url) => {
    let suffixQuery = url.replace(/.+\./, "");
    if (suffixQuery.indexOf("?") !== -1) {
        return suffixQuery.substr(0, suffixQuery.indexOf("?") !== -1);
    } else {
        return suffixQuery;
    }
};

/**
 * 距离相关 getDistanceByPoint依赖开始
 * @type {number}
 */
const EARTH_RADIUS = 6378137.0; //单位M
const PI = Math.PI;

const getRad = (d) => {
    return (d * PI) / 180.0;
};

/**
 * 返回两个位置间的真实距离
 * @param {Object} lat1
 * @param {Object} lng1
 * @param {Object} lat2
 * @param {Object} lng2
 * @return {Number} 距离，单位米
 */
export const getFlatternDistance = (lat1, lng1, lat2, lng2) => {
    let f = getRad((lat1 + lat2) / 2);
    let g = getRad((lat1 - lat2) / 2);
    let l = getRad((lng1 - lng2) / 2);

    let sg = Math.sin(g);
    let sl = Math.sin(l);
    let sf = Math.sin(f);

    let s, c, w, r, d, h1, h2;
    let a = EARTH_RADIUS;
    let fl = 1 / 298.257;

    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;

    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;

    w = Math.atan(Math.sqrt(s / c));
    r = Math.sqrt(s * c) / w;
    d = 2 * w * a;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;
    return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
};

/**
 * 根据坐标点与用户定位计算距离,并格式化成文字展示
 * @param lat
 * @param lng
 * @returns {string} 格式化后的距离显示
 */
export const getDistanceByPoint = (lat, lng) => {
    let { wxCoordinate } = wx._location;
    let distance = "--";
    if (wxCoordinate?.lat > 0 && lat && lng) {
        distance = getFlatternDistance(
            parseFloat(lat),
            parseFloat(lng),
            parseFloat(wxCoordinate.lat),
            parseFloat(wxCoordinate.lng)
        );
        if (parseInt(distance) > 1000) {
            distance = (distance / 1000).toFixed(1) + "km";
        } else {
            distance = parseInt(distance) + "m";
        }
    }else {
        distance = ""
    }
    return distance;
};

/**
 * 距离格式化
 * @param {Number} dis 距离，单位公里
 * @returns
 */
export const formatDistance = function (dis) {
    if (!dis) return ''
    let unit = "km";
    if (dis < 0) {
        dis = dis * 1000;
        unit = "m";
    }
    dis = dis.toFixed(1);
    return dis + unit;
};

// 坐标系转换类
export const GPS = {
    PI: 3.14159265358979324,
    x_pi: (3.14159265358979324 * 3000.0) / 180.0,
    //GCJ-02 to BD-09
    bd_encrypt: function (gcjLat, gcjLng) {
        let x = gcjLng,
            y = gcjLat;
        let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);
        let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);
        let bdLng = z * Math.cos(theta) + 0.0065;
        let bdLat = z * Math.sin(theta) + 0.006;
        return { lat: bdLat, lng: bdLng };
    },
};

/**
 * 平铺数组
 * @param {Array} arr 多维数组
 * @returns 一维数组
 */
export const flatten = (arr) => {
    return arr.reduce(function (prev, item) {
        return prev.concat(Array.isArray(item) ? flatten(item) : item);
    }, []);
};

/**
 * 格式化浮点数
 * @param {Number} val 需要转换的数字，如果传入整数，则返回整数
 * @param {Number} pos 需要保留几位小数，默认2位
 */
export const fomatFloat = (val, pos = 2) => {
    return Math.round(val * Math.pow(10, pos)) / Math.pow(10, pos);
};

/**
 * 数字单位化
 * @param {num} val 需要转换的数字，比如 10000 => 1.0w   1000 => 1.0k
 */
export function formatNumber(num){
    if( num >= 10000 ){
        num = Math.round(num / 1000)/10 + 'W';
    }else if( num >= 1000 ){
        num = Math.round(num / 100)/10 + 'K';
    }
    return num;
}

/**
 * 获取太阳码参数 标准格式c=123
 * @param params 太阳码支持c=x格式、c-x格式
 * @param name
 * @returns {string|null}
 */
export function  getQueryByScene(params,name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = params.match(reg);
    if (r != null) return unescape(r[2]);

    var reg2=new RegExp("(^|&)" + name + "-([^&]*)(&|$)", "i");
    var r2=params.match(reg2);
    if (r2 != null) return unescape(r2[2]);
    return null;
}

export function isObject (v) {
    return Object.prototype.toString.call(v) === '[object Object]'
}
export function isArray (arr) {
    return Array.isArray(arr)
}

