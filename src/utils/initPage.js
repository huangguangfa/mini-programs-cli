import router from "@/router";
import Tips from "./toast";
import { initWatcher } from "@/lib/omi/watch/index";
const OriginalPage = Page;
export default function init(app) {
    wx._router = router;
    Page = function (obj = {}) {
        let { onLoad, onShow, onUnload } = obj;
        obj.onLoad = function (options) {
            router.pageOnload();
            this.options = options;
            this.$router = router;
            this.$tips = Tips;
            onLoad && onLoad.call(this, options);
            //有watch触发监听观察者模式、这里必须等onLoad把数据初始化后才可以去监听对象
            initWatcher(this);
        };
        obj.onShow = function () {
            onShow && onShow.call(this);
        };
        obj.onUnload = function () {
            router.pageUnload();
            onUnload && onUnload.call(this);
        };
        return OriginalPage(obj || {});
    };
}
