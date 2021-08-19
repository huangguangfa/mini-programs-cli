const app = getApp();
/**
 * 获取元素信息
 * @param {String} selector 可以是元素id名 类名 或者标签名
 * @param {Boolean} all 是否查找全部
 */
export const getDom = (selector, all = false) => {
    return new Promise((resolve, reject) => {
        let query = wx.createSelectorQuery();
        if (all) {
            query
                .selectAll(selector)
                .boundingClientRect(function (res) {
                    resolve(res);
                })
                .exec();
        } else {
            query
                .select(selector)
                .boundingClientRect(function (res) {
                    resolve(res);
                })
                .exec();
        }
    });
};

/**
 * 可使用窗口信息
 */
const getViewport = () => {
    return new Promise((resolve, reject) => {
        const query = wx.createSelectorQuery();
        query
            .selectViewport()
            .boundingClientRect(function (res) {
                if (res) {
                    resolve(res);
                }
            })
            .exec();
    });
};

/**
 * 获取页面头部样式
 * @param {Function} callback 返回custom为自定义头部 default为页面默认头部
 */
export const getPageNavigationStyle = (callback) => {
    wx.getSystemInfo({
        success: ({ screenHeight }) => {
            getViewport().then((res) => {
                // 可使用窗口高度
                let windowHeight = res.height;
                callback && callback(screenHeight === windowHeight ? "custom" : "default");
            });
        },
    });
};

/**
 * 获取页面自定义头部占位高度
 */
export const getPageCustomTitleBarFootprintAreaHeight = () => {
    return (app.global.systemInfo?.statusBarHeight || 0) + 46;
};
