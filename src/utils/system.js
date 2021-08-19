
const app = getApp();

/**
 * 比较版本号(微信提供)
 * @param {*} v1
 * @param {*} v2
 */
export const compareVersion = (v1, v2) => {
    v1 = v1.split(".");
    v2 = v2.split(".");
    const len = Math.max(v1.length, v2.length);

    while (v1.length < len) {
        v1.push("0");
    }
    while (v2.length < len) {
        v2.push("0");
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i]);
        const num2 = parseInt(v2[i]);

        if (num1 > num2) {
            return 1;
        } else if (num1 < num2) {
            return -1;
        }
    }

    return 0;
};

/**
 * 检查当前版本是否大于指定版本
 * @param {*} version 指定版本
 */
export const checkSDKVersion = (version) => {
    return new Promise((resolve, reject) => {
        wx.getSystemInfo({
            success: (res) => {
                const currentVersion = res.SDKVersion;
                if (compareVersion(currentVersion, version) >= 0) {
                    resolve(currentVersion);
                } else {
                    reject(currentVersion);
                }

            },
        });
    });
};

/**
 * 检查小程序更新
 * @param {*} options  app.js onShow参数
 */
export const checkMiniProgramUpgrade = (options) => {
    if (wx.canIUse("getUpdateManager") && options.scene) {
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调,
            // 有新版本，则自动异步下载，并在下载完成后触发onUpdateReady函数
            console.log("new Version ?", res.hasUpdate);
        });
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: "更新提示",
                content: "小程序有新的优化，马上更新吧",
                showCancel: false,
                success(res) {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    updateManager.applyUpdate();
                },
            });
        });
        updateManager.onUpdateFailed(function () {
            // 新版本下载失败
            wx.showModal({
                title: "更新提示",
                content: "小程序更新失败，建议在微信首页下拉删除小程序后再访问",
                showCancel: false,
                success(res) {},
            });
        });
    }
};

/**
 * 检查用户授权某个功能，入定位、用户信息等，没授权提醒授权操作
 * @param {string} scopeName 授权的scope
 * @see 参考 https://developers.weixin.qq.com/miniprogram/dev/api/open-api/setting/AuthSetting.html
 */
 export const checkAuth = (scopeName) => {
    return new Promise((resolve, reject) => {
        if (!scopeName) {
            reject();
            return;
        }
        wx.getSetting({
            success({ authSetting }) {
                const scope = `scope.${scopeName}`;
                if (typeof authSetting[scope] === "undefined") {
                    // 未授权过
                    wx.authorize({
                        scope,
                        success() {
                            resolve();
                        },
                        fail() {
                            reject();
                        },
                    });
                } else if (!authSetting[scope]) {
                    // 权限被禁止
                    wx.showModal({
                        title: "提示",
                        content: "如需正常使用小程序功能，请点击授权",
                        showCancel: false,
                        confirmText: "前往授权",
                        success({ confirm }) {
                            if (confirm) {
                                wx.openSetting({
                                    success({ authSetting }) {
                                        if (authSetting[scope]) {
                                            resolve();
                                        } else {
                                            reject();
                                        }
                                    },
                                    fail(e) {
                                        console.log(e);
                                        reject();
                                    },
                                });
                            } else {
                                reject();
                            }
                        },
                    });
                } else {
                    resolve();
                }
            },
            fail() {
                reject();
            },
        });
    });
};
