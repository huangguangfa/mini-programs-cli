import router from "@/router";
import Tips from "./toast";
import { initWatcher } from "@/lib/watch/index";
import store from '../store/index.js';
export default function initPage() {
    //初始化页面配置对象
    const INITCONFIG = {
        App: {
            lifetimes:"onLoad",
            instance:App,
        },
        Page:{
            lifetimes:"onLoad",
            instance:Page
        },
        Component:{
            lifetimes:"attached",
            instance:Component
        },
        Behavior:{
            lifetimes:"attached",
            instance:Behavior
        }
    }
    for( let key in INITCONFIG ){
        const { instance, lifetimes } = INITCONFIG[key];
        let pageHook = ( pageConfig = {} ) =>{
            const originlifecycleHook = pageConfig[lifetimes];
            //混入页面的钩子、做初始化作用
            pageConfig[lifetimes] = function(options){
                router.pageOnload();
                this.options = options;
                this.$router = router;
                this.$tips = Tips;
                store.initPageStore( pageConfig ,this);
                initWatcher(this);
                originlifecycleHook && originlifecycleHook.apply(this, arguments);
            }
            instance(pageConfig)
        }
        interceptorPageInstance(pageHook, key);
    }
}

function interceptorPageInstance(pageHook, key){
    const active = new Map([
        [
            'App',
            () =>{
                App = pageHook
            }
        ],
        [
            'Page',
            () =>{
                Page = pageHook
            }
        ],
        [
            'Component',
            () =>{
                Component = pageHook
            }
        ],
        [
            'Behavior',
            () =>{
                Behavior = pageHook
            }
        ]
    ])
    active.get(key)()
}
