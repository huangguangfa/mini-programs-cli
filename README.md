### 小程序cli

#### 基于webpack4实现的一套小程序cli、目前集成： router管理、store全局状态、watch监听、在后面将会考虑把compute加入进来！

#### store全局状态管理的使用 （ 基本上和vue那一套差不多、但也有一些区别）
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

#### router路由说明
- 通过全局wx._router 或者页面 this.$router操作路由实例
- 通过维护一个route.json页面列表，this.$router跳转通过页面对应name进行寻址，
- 全局路由钩子beforeEach，可以对页面跳转前进行拦截操作

##### router.json配置示例
```js
// 页面配置
{
  pages: [
    {
      name: "demo",
      path: "demo/index",
      isTabbar: true,
    },
    {
      isSub: true,
      name: "sub",
      root: "pagesSub/sub",
      pages: [
        {
          name: "index",
          path: "index/index",
          auth: true,
        },
        {
          isSub: true,
          name: "sub2Goods",
          root: "sub2-goods",
          pages: [
            {
              name: "index",
              path: "index/index",
            },
            {
              auth: true,
              name: "detail",
              path: "detail/index",
            },
          ],
        },
      ],
    },
  ];
}
```
##### 实例方法

|  可用方法   | 对应原生方法  | 说明 |
|  ----  | ----  | ----  |
| go  | navigateTo | 跳转页面 |
| go  | switchTab | 跳转tabbar页面 |
| replace  | redirectTo | 重定向页面 |
| relaunch  | relaunch | 关闭所有页面，打开某个页面 |
| getQuery  | onLoad(options)   | 获取页面路径?后面参数，用于简单的页面数据传递 |
| getParams   |    | 获取路由跳转是设定的params参数，用于多数据页面传递 |

- 示例
```js
/**
 * 路由跳转
 * @param {String} pathName 路由表页面路径所对应的name，分包子页面通过name.name查找
 * @param {Object} preload 传值对象 query：对应页面路径?后面参数 params：自定义数据
 */
this.$router.go("demo2", {
    query: {
        a: 1,
        b: 2,
    },
    params: {
        ops: [1, 1, 2, 3, 4, 5],
    },
});
this.$router.replace("sub2.index", {
    params: {
        a: 1
    }
});

/**
 * 获取路由跳转query
 */
this.$router.getQuery();

onLoad(options){
    console.log(options);
}


/**
 * 获取路由跳转params
 */
this.$router.getParams();
```