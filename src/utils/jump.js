
import env from "@env";
import { GPS } from "@utils/util";

/**
 * 跳转到小程序
 * @param {String,Number} type 跳转的小程序 0门店小程序 1优剪小程序 2橘子小程序
 * @param {String} path 跳转路径
 * @extraData {Object} coordinate 返回定位坐标经纬度信息
 */
export const navigateToMiniProgram = ({ type = 0, path } = {}) => {
    const { value: _env, appIdUdream, appIdOrange } = env;
    const { lat, lng } = wx._location.coordinate;
    const bdGps = GPS.bd_encrypt(lat, lng);

    wx.navigateToMiniProgram({
        appId: [appIdStore, appIdUdream, appIdOrange][+type],
        path,
        extraData: {
            coordinate: {
                lat,
                lng,
                lat_bd: bdGps.lat,
                lng_bd: bdGps.lng,
            },
        },
        envVersion: _env != "prod" ? "trial" : "release",
    });
};

/**
 * 根据url跳转对应的页面（小程序页面或H5webview）
 * @param {String} url 跳转的路径（小程序和H5）
 */
export const navigateToPageByUrl = (url) => {
    if (!url) return;
    if (url.includes("http")) {
        url = `/pages/webview/index?url=${encodeURIComponent(url)}`;
    }
    wx._router.go(url);
};
