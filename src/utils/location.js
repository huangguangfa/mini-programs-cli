/*
 * @Author: elvis.lam
 * @Desc: 定位信息类
 * @Date: 2020-11-07 10:18:18
 * @Last Modified by: elvis.lam
 * @Last Modified time: 2021-05-12 14:44:36
 */

/**
 * 使用说明
 * wx._location.check((location) => { callback... }) 初始化和检查定位
 * wx._location.refreshLocation((location) => { success... }) 重新授权定位，外部必须使用原生点击事件触发次方法才起效
 */

// 私有变量，外部不可访问
const getLocation = Symbol("getLocation");
export default class Location {
    // 单例创建
    static getInstance() {
        if (!Location.instance) {
            Location.instance = new Location();
            return Location.instance;
        }
        return Location.instance;
    }

    // Location的单例
    instance = null;

    // 获取定位状态 pending进行中 fulfilled已完成 rejected拒绝/失败
    status = "pending";

    // 用户原始坐标（微信授权获得）
    wxCoordinate = { lat: '', lng: '' };

    // 用户当前坐标（可根据城市切换）
    coordinate =  { lat: '', lng: '' };

    /**
     * 设置默认经纬度（别的小程序带进来）
     * @param {Object} coordinate 别的小程序默认带过来的坐标
     */
    setDefaultLocation(coordinate) {
        this.status = "fulfilled";
        this.wxCoordinate = this.coordinate = coordinate;
    }

    /**
     * 检查是否获得定位信息和城市信息
     * @param {Function} callback 调用结束回调，返回整个location实例，通过实例的status查看授权状态
     */
    check(callback) {
        const { status, coordinate } = this;
        if (status === "fulfilled") {
            callback && callback(this);
        } else {
            this[getLocation]()
                .then(async (res) => {
                    callback && callback(this);
                })
                .catch(() => {
                    callback && callback(this);
                });
        }
    }

    /**
     * 重新获取定位
     * @param {Function} callback 成功回调，返回当前实例
     */
    refreshLocation(callback) {
        wx.openSetting({
            success: async (res) => {
                if (res.authSetting["scope.userLocation"]) {
                    this.rejectTimestamp = 0;
                    this.check(() => {
                        callback && callback(this);
                    });
                } else {
                    callback && callback(this);
                }
            },
            fail: (e) => {
                callback && callback(this);
            },
        });
    }

    /**
     * 私有方法-获取用户定位经纬度
     */
    [getLocation]() {
        return new Promise((resolve, reject) => {
            if (this.status === "fulfilled") {
                resolve(this.coordinate);
            } else {
                wx.getLocation({
                    type: "gcj02",
                    success: ({ latitude, longitude }) => {
                        this.wxCoordinate = this.coordinate = {
                            lat: latitude,
                            lng: longitude,
                        };
                        this.status = "fulfilled";
                        resolve(this.coordinate);
                    },
                    fail: (err) => {
                        // 拒绝后一天不再弹窗
                        if (Date.now() < (this.rejectTimestamp || 0) + 86400000) {
                            return reject();
                        }
                        // 用户拒绝后尝试打开小程序授权设置页面
                        wx._tips
                            .confirm({
                                title: "温馨提示",
                                content: "无法获取您的定位，请重新授权",
                                confirmText: "重新授权",
                                cancelText: "知道了",
                            })
                            .then(() => {
                                wx.openSetting({
                                    success: async (res) => {
                                        if (res.authSetting["scope.userLocation"]) {
                                            // 成功后再次调用自身
                                            let _coordinate = await this[getLocation]();
                                            resolve(_coordinate);
                                        } else {
                                            handleReject.call(this);
                                        }
                                    },
                                    fail: (e) => {
                                        handleReject.call(this);
                                    },
                                });
                            })
                            .catch(() => {
                                handleReject.call(this);
                            });
                        function handleReject() {
                            reject();
                            this.status = "rejected";
                            this.rejectTimestamp = Date.now();
                        }
                    },
                });
            }
        });
    }
}
