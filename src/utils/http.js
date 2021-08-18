/*
 * @Author: elvis.lam
 * @Desc: http封装
 * @Date: 2020-08-24 16:21:50
 * @Last Modified by: elvis.lam
 * @Last Modified time: 2021-08-16 16:06:40
 * @See https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
 */
import Tips from "./toast";
import User from "./user";
import { RLogWarn } from "./log";

/**
 * 重新登录处理器
 * 多个接口401会多次触发LoginHandler，为了减少重复登录请求，只在第一次触发的时候请求登录，其余401走300ms定时器，监测到请求完成继续往下走
 * @child {Boolean} waiting 请求锁，请求一次后锁上
 * @child {String} status 等待请求 pending 请求完成 fulfilled
 */
class Login {
    static waiting = false;

    static status = "pending";

    static goLogin() {
        this.waiting = true;
        wx.navigateTo({
            url: "/pages/login/login",
        });
        setTimeout(() => {
            this.status = "fulfilled";
            this.waiting = false;
        }, 1000);
    }

    static timeout(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    static async run() {
        const { waiting, status } = this;
        // 已完成
        if (status == "fulfilled") {
            return true;
        }
        // 请求中
        if (waiting && status == "pending") {
            await this.timeout(300);
            await this.run();
        }
        // 未开始
        if (!waiting && status == "pending") {
            this.goLogin();
        }
    }
}

export default class Http {
    /**
     * 变量
     * @attr {Array} httpSuccessBusinessCodes 业务请求成功状态码
     * @attr {String} baseUrl 请求域名
     */
    static httpSuccessBusinessCodes = ['000000'];
    static baseUrl = '';

    /**
     * 设置默认的值
     * @param {String} baseUrl  默认baseUrl
     */
    static setDefaultValue({ baseUrl = '', httpSuccessBusinessCodes = [] } = {}) {
        this.httpSuccessBusinessCodes = this.httpSuccessBusinessCodes.concat(httpSuccessBusinessCodes)
        this.baseUrl = baseUrl
    }

    /**
     * 请求封装
     * @param {String} path  请求路径（地址）
     * @param {String} method 请求类型
     * @param {Object, String} data 请求参数，如果传字符串对象，则请求类型为application/json，仅对post请求有效
     * @param {Object} header 请求header头参数设置
     * @param {Boolean} showLoading 接口是否显示loading
     * @param {String} loadingText loading提示文案，默认：正在加载
     * @param {Boolean} isLogin 是否是请求登录接口
     * @param {String} baseUrl 自定义设置请求域名
     * @param {Boolean} isWarnToast 是否显示错误信息，默认显示
     */
    static async request(params = {}) {
        let {
            path,
            method,
            data = {},
            header = {},
            showLoading = true,
            loadingText = "正在加载",
            isLogin = false,
            baseUrl,
            isWarnToast = true,
        } = params;
        // 处理请求
        return new Promise((resolve, reject) => {
            baseUrl = baseUrl || this.baseUrl;
            data = this.filterParameters(data);
            // 判断是否是全路径
            if (!path.includes("http")) {
                // 路径补齐
                path = `${!path.startsWith("/") ? "/" : ""}${path}`;
            } else {
                baseUrl = "";
            }
            const app = getApp();
            const url = `${baseUrl}${path}`;
            const cookie = wx.getStorageSync("cookie") || "";

            if (showLoading) Tips.showLoading(loadingText);
            wx.request({
                url,
                method,
                data,
                header: Object.assign(header, {
                    cookie,
                    "content-type": typeof data === "object" ? "application/x-www-form-urlencoded" : "application/json",
                }),
                success: async (response) => {
                    const { statusCode, data = {} } = response;

                    setTimeout(() => {
                        Tips.hideLoading();
                    }, 300);

                    // 未登录
                    if (statusCode === 401) {
                        await Login.run();
                    }
                    // 检查http状态码异常
                    if (statusCode !== 200) {
                        return reject(this.errorHandler(response, isWarnToast));
                    }
                    if (statusCode == 200 && response.data.retCode === "000001") {
                        RLogWarn(
                            {
                                step: `${method}000001`,
                                requestUrl: url,
                                param: JSON.stringify(data),
                                uid: app.global.userInfo?.id || "",
                                res: response || "",
                            },
                            `${method}000001`
                        );
                    }
                    // handle success
                    if (
                        this.httpSuccessBusinessCodes.includes(data.retCode) ||
                        url.includes(".json") ||
                        (baseUrl.includes("https://api.map.baidu.com") && data.status == 0)
                    ) {
                        resolve(isLogin ? response : data);
                    } else {
                        reject(this.errorHandler(response, isWarnToast));
                    }
                },
                fail: (e) => {
                    RLogWarn(
                        {
                            step: `${method}fail`,
                            requestUrl: url,
                            param: JSON.stringify(data),
                            uid: app.global.userInfo?.id || "",
                            res: e?.errMsg || "",
                        },
                        `${method}fail`
                    );
                    reject(this.errorHandler(e, isWarnToast));
                },
            });
        });
    }

    /**
     * 请求参数过滤
     * @param {Object} data
     */
     static filterParameters(data) {
        Object.keys(data).forEach(attr => {
            if ([null, undefined].includes(data[attr])) delete data[attr]
        })
        return data
    }

    /**
     * 请求错误处理
     * @param {Object} response 接口返回的错误异常对象
     * @param {Boolean} isWarnToast 是否显示toast
     * @extends 当response.data有值时表示http响应成功但是业务retCode码异常
     */
    static errorHandler(response, isWarnToast) {
        const { statusCode, data } = response;
        const isObject = (obj) => Object.prototype.toString.call(obj) === "[object Object]";
        let error = {};
        let businessData = data;
        error.statusCode = statusCode;
        // bussiness code error & http request status error
        if (businessData && isObject(businessData)) {
            error = Object.assign({}, error, businessData);
        } else {
            error = Object.assign({}, error, {
                retCode: "",
                retMsg: "接口请求失败",
                result: {},
                success: false,
            });
        }
        Tips.hideLoading();
        if (isWarnToast) Tips.toast(error.retMsg || error.message || error.error);
        return error;
    }

    /**
     * get/post 请求入口
     */
    static get(path, data = {}, { header, showLoading, loadingText, isLogin, baseUrl } = {}) {
        return this.request({ method: "GET", path, data, header, showLoading, loadingText, isLogin, baseUrl });
    }

    static post(path, data = {}, { header, showLoading, loadingText, isLogin, baseUrl } = {}) {
        return this.request({ method: "POST", path, data, header, showLoading, loadingText, isLogin, baseUrl });
    }
}
