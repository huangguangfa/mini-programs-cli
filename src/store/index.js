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
})