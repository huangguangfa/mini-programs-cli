/*
 * @Author: elvis.lam
 * @Desc: 微信api封装
 * @Date: 2020-06-11 19:21:50
 * @Last Modified by: elvis.lam
 * @Last Modified time: 2021-08-02 14:40:03
 */

/**
 * 消息提示封装
 */
export default class Tips {
	/**
	 * 静态变量，是否加载中
	 */
    static isLoading = false;

	/**
	 * 弹出确认窗
	 */
	static confirm({
		title = '',
		content = '',
		showCancel = true,
		confirmText = '确认',
		cancelText = '取消',
		payload = {},
	} = {}) {
		return new Promise((resolve, reject) => {
			wx.showModal({
				title,
				content,
				showCancel,
				confirmText,
				cancelText,
				success: res => {
					if (res.confirm) {
						resolve(payload);
					} else if (res.cancel) {
						reject(payload);
					}
				},
				fail: res => {
					reject(payload);
				},
			});
		});
	}

	/**
	 * 消息提示框
	 */
	static toast(title) {
        return new Promise((resolve) => {
            wx.showToast({
				title: title,
				icon: 'none',
				mask: false,
				duration: 2500,
			});
			setTimeout(() => {
				resolve()
			}, 2500);
        })
    }

   	/**
	 * 成功提示框
	 */
	static success(title) {
        return new Promise((resolve) => {
            wx.showToast({
				title,
				icon: 'success',
				mask: false,
				duration: 2500,
			});
			setTimeout(() => {
				resolve()
			}, 2500);
        })
	}

	/**
	 * 错误框
	 */
	static error(title) {
        return new Promise((resolve) => {
            wx.showToast({
                title,
                icon: 'error',
                mask: true,
                duration: 2500,
            });
			setTimeout(() => {
				resolve()
			}, 2500);
        })
	}

	/**
	 * 弹出加载提示
	 */
	static showLoading(title = '正在加载') {
		if (Tips.isLoading) {
			return;
		}
		Tips.isLoading = true;
		wx.showLoading({
			title: title,
			mask: true,
		});
	}

	/**
	 * 隐藏加载提示
	 */
	static hideLoading() {
		if (Tips.isLoading) {
			Tips.isLoading = false;
			wx.hideLoading();
		}
	}
}