
/**
 * 使用说明
 * @use  wx._user.check(() => {}, true) 用户登录校验，第一个参数为登录成功后回调函数，第二个参数为未登录情况下是否需要跳转到登录页面，默认true，设置false也可以拿到openId
 *       wx._user.login() 用户登录 第一个参数为未登录情况下是否需要跳转到登录页面
 *       wx._user.update() 用户信息更新，通过登录后无法获取用户头像和昵称，需要手动触发按钮更新，第一个参数为微信用户授权信息对象，第二个为更新成功后回调函数
 * @hooks
 *      emit: user-openid-success  获取授权接口成功后广播
 *      emit: auth-success wx._user.check的callback后广播，提供给其页面组件内监听是否授权回调使用
 *      on: login-success 接收授权页面授权成功后广播，并通过wx._user.check的callback传播回页面
 * @extends User类已经注入到wx._user对象中，可以直接调用wx._user.xxx()调用
 * @see: 登录流程图 https://wx-test.51yxm.com/html5/root/MiniPragram/platform/images/process/login_process.svg
 */
import Http from "./http";
import $eventBus from "@lib/eventBus";

// 小程序app对象
let app = {};
// 小程序appId
let appId = '';
// 私有变量，外部不可访问
let getUserInfo = Symbol("getUserInfo");

export default class User {
    /**
     * 初始化
     * @param {Object} defaultValue 默认值
     */
    static creatInstance(defaultValue) {
        const userInfo = wx.getStorageSync("userInfo") || {};
        const channelLinks = wx.getStorageSync("channelLinks") || [];

        this.setBaseVariable(defaultValue)
        // 获取用户信息
        if (userInfo.id) {
            if (+new Date() - userInfo.timestamp > 86400000) {
                wx.removeStorageSync("userInfo");
                wx.removeStorageSync("cookie");
            } else {
                app.global.userInfo = userInfo;
            }
        }
        // 获取用户登录渠道
        if (channelLinks?.length > 0) {
            let openTokenMap = {};
            channelLinks.forEach((item) => {
                openTokenMap[item.appid] = item;
            });
            let miniInfo = channelLinks.filter((el) => {
                return el.appid == appId;
            });
            app.global.openTokenMap = openTokenMap;
            app.global.openToken = miniInfo[0];
        }
    }

    /**
     * 初始化
     * @param {Object} app 小程序app对象
     * @param {String} appId 小程序appId
     */
    static setBaseVariable({ app: _app = {}, appId: _appId = '' } = {}) {
        app = _app;
        appId = _appId;
    }

    // 检查是否登录
    static check(callback, isJump = true) {
        const { userInfo } = app.global;
        if (!callback) return;
        if (userInfo?.id && +new Date() - userInfo?.timestamp <= 86400000) {
            $eventBus.$emit("auth-success");
            return callback({ user: userInfo });
        }
        this.login(isJump).then((res) => {
            if (!res) {
                wx._eventBus.$off("login-success");
                wx._eventBus.$on("login-success", callback);
            } else {
                $eventBus.$emit("auth-success");
                callback(res);
            }
        });
    }

    // 用户登录
    static login(isJump = true) {
        //返回Promise，用于本身login登录重试机制默认一直会重试登录
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    this[getUserInfo](res, isJump)
                        .then((result) => {
                            $eventBus.$emit("user-openid-success");
                            resolve(result);
                        })
                        .catch(() => {
                            reject();
                        });
                },
            });
        });
    }

    // 更新用户信息
    static update(e, callback) {
        let userInfo = {};
        if (app.global.userInfo.id) {
            userInfo = {
                id: app.global.userInfo.id,
                nickname: e.nickName,
                sex: e.gender,
                city: e.city,
                province: e.province,
                country: e.country,
                headImgUrl: e.avatarUrl,
            };
            Http.post("/base/user/user/updateUser", JSON.stringify(userInfo)).then(() => {
                next();
            });
        } else {
            userInfo = {
                openId: app.global.openToken.openid,
                nickname: e.nickName,
                sex: e.gender,
                headImgUrl: e.avatarUrl,
            };
            Http.get("/base/user/channelLink/updateChannelLink", userInfo).then((res) => {
                next();
            });
        }
        function next() {
            app.global.userInfo = { ...app.global.userInfo, ...userInfo };
            wx.setStorageSync("userInfo", app.global.userInfo);
            callback && callback();
        }
    }

    // 私有方法 获取用户信息
    static [getUserInfo]({ code }, isJump) {
        let param = {
            appid: appId,
            code,
        };
        return new Promise((resolve, reject) => {
            Http.post("/base/user/wx/miniapp/auth", param, { isLogin: true })
                .then((res) => {
                    let response = res.data;
                    let cookie = res.header["Set-Cookie"];
                    if (response.retCode === "000000") {
                        const userInfo = response.result.user || {};
                        let openTokenMap = {};
                        response.result.channelLinks.forEach((item) => {
                            openTokenMap[item.appid] = item;
                        });
                        let miniInfo = response.result.channelLinks.filter((el) => {
                            return el.appid == appId;
                        });
                        app.global.openToken = miniInfo[0];
                        app.global.openTokenMap = openTokenMap;
                        wx.setStorageSync("channelLinks", response.result.channelLinks || []);
                        // 是否创建了用户信息
                        if (userInfo.id) {
                            const mobile = userInfo.mobile;
                            userInfo.m = mobile ? mobile.replace(mobile.substring(3, 7), "****") : mobile;
                            userInfo.timestamp = +new Date();
                            // 用户信息
                            app.global.userInfo = userInfo;
                            wx.setStorageSync("userInfo", userInfo);
                            wx.setStorageSync("cookie", cookie);
                            resolve(response.result);
                        } else {
                            console.log('userInfo',response)
                            if (isJump) {
                                resolve();
                                return wx._router.go("login");
                            }
                            resolve(response.result);
                        }
                    }
                })
                .catch(() => {
                    reject();
                });
        });
    }
}
