import "@utils/prototype";
import '@lib/mixins';
import env from "@env";
import EventBus from "@lib/eventBus";
import Tips from "@utils/toast";
import Location from "@utils/location";
import User from "@utils/user";
import Http from "@utils/http";
import initPage from "@utils/initPage";
import { patchPage } from "@lib/miniprogrampatch";
import { checkMiniProgramUpgrade } from "@utils/system";


import store from './lib/store/index.js';
store.install()

App({
    global: {
        //小程序appId
        appId: env.appId,
        // 环境配置信息
        env,
        // 用户设备信息
        systemInfo: {
            isIos: false,
        },
    },
    onLaunch() {
        wx._eventBus = EventBus;
        wx._tips = Tips;
        wx._http = Http;
        wx._user = User;
        wx._env = env;
        wx._location = Location.getInstance();
        // 初始化http请求默认参数
        Http.setDefaultValue({ baseUrl: env.api, httpSuccessBusinessCodes: ['100000'] });
        // 初始化用户信息（包含登录）
        User.creatInstance({ app: this, appId: env.appId });
        // 重写page方法
        // initPage(this);
        Page = patchPage(Page);
        // 获取系统信息
        this.getSystemInfo();
    },
    onShow(options) {
        // 检查小程序更新
        checkMiniProgramUpgrade(options);
    },
    // 获取手机系统相关信息
    getSystemInfo() {
        wx.getSystemInfo({
            success: (res) => {
                this.global.systemInfo = res;
                this.global.systemInfo.isIos = !!(res.platform == "ios");
            },
        });
    },
});
