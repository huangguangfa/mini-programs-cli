import router from "@/router";
import Tips from "./toast";
import { initWatcher } from "@/lib/omi/watch/index";
import store from '../store/index.js';
export default function initPage() {
    //初始化页面配置对象
    const INITCONFIG = {
        App: { lifetimes:"onLoad", instance:App },
        Page:{ lifetimes:"onLoad", instance:Page },
        Component:{ lifetimes:"attached", instance:Component },
        Behavior:{ lifetimes:"attached", instance:Behavior }
    }
    for( let key in INITCONFIG ){
        const { instance, lifetimes } = INITCONFIG[key];
        let receivePageConfig = ( pageConfig = {} ) =>{
            const originlifecycleHook = pageConfig[lifetimes];
            pageConfig[lifetimes] = function(options){
                router.pageOnload();
                this.options = options;
                this.$router = router;
                this.$tips = Tips;
                store.initStore( pageConfig ,this)
                //watch绑定
                initWatcher(this);
                originlifecycleHook && originlifecycleHook.apply(this, arguments)
            }
            instance(pageConfig)
        }
        switch (instance) {
            case App:
                App = receivePageConfig
                break;
            case Page:
                Page = receivePageConfig
                break;
            case Component:
                Component = receivePageConfig
                break;
            case Behavior:
                Behavior = receivePageConfig
                break;
            default:
            return
        }
    }
}
