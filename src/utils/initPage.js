import router from "@/router";
import Tips from "./toast";
import { initWatcher } from "@/lib/watch/index";
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
        let mutator = ( pageConfig = {} ) =>{
            const originlifecycleHook = pageConfig[lifetimes];
            pageConfig[lifetimes] = function(options){
                router.pageOnload();
                this.options = options;
                this.$router = router;
                this.$tips = Tips;
                store.initStore( pageConfig ,this)
                initWatcher(this);
                originlifecycleHook && originlifecycleHook.apply(this, arguments)
            }
            instance(pageConfig)
        }
        switch (instance) {
            case App:
                App = mutator
                break;
            case Page:
                Page = mutator
                break;
            case Component:
                Component = mutator
                break;
            case Behavior:
                Behavior = mutator
                break;
            default:
            return
        }
    }
}
