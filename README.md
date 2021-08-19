### 小程序cli

#### 基于webpack4实现的一套小程序cli、目前集成了：页面的router、全局状态管理store、页面变量的watch监听、在后面将会考虑把compute加入进来！

#### 全局状态管理的使用 （ 基本上和vue那一套差不多、但也有一些区别）
```js
//注册store字段
import Store from '@/lib/store/index.js';
export default new Store({
    state: {
        count: {
            ISLOCAL: true,
            default: 0
        },
        store_name:'张三',
        store_info:{
            id:'1234567',
            list:[1,2,3,4]
        }
    },
    action: {
        asyncSetUserInfo({ commit },data){
            setTimeout( () =>{
                commit('store_info',data)
            },1000)
        }
    }
}

//页面使用
// /pages/index/index.js
Page({
    mapState: ['count', 'store_name','store_info'], //之后你可以通过this.data.xxx => 获取到store的值
    data:{},
    updateStore () {
        this.$store.commit("count", ++this.data.count);
        this.$store.commit("store_name", '修改后的name');
        this.$store.dispatch('asyncSetUserInfo',{
            id:4894654654,
            list:[7,8,9]
        })
    },
});
// /pages/index/index.wxml
<view class="index">
    <view>{{ count}}</view>
    <view class="mark"> 门店名称: {{ store_name }}</view>
    <view class="mark"> 门店信息: {{ store_info.id }}</view>
    <view wx:for="{{ store_info.list }}" wx:key="index">{{ item }}</view>
    <button bindtap="updateStore">修改信息</button>
</view>


```