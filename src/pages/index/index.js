
Page({
    mapState: ['count', 'store_name','store_info'],
    data:{
        name:'张三',
        test:{
            n:'张1111',
            a:'1997'
        },
        list:[1,2,3]
    },
    onLoad(){
        console.log(this)
    },
    toPage(){
        this.$router.go('demo')
    },
    computed: {
        demo: function () {
            return this.name
        }
    },
    watch:{
        count(n,o){
            console.log('vuex--count---数据变化了',n,o);
        },
        store_info(n, o){
            console.log('vuex---store_info--数据变化了',n, o);
        },
        "test.a":{
            handler(newName, oldName) {
               console.log('watch---change',newName, oldName)
            }
        },
        name(){
            console.log('watch---change name')
        },
        list(){
            console.log('watch---change List')
        }
    },
    updateStore () {
        this.$store.commit("count", ++this.data.count);
        this.$store.commit("store_name", '修改后的name');
        this.$store.dispatch('asyncSetUserInfo',{
            id:4894654654,
            list:[7,8,9]
        })
    },
    updateLocalData(){
        this.setData({
            name:'李四',
            ['test.a']:'测试111111111111111111'
        })
    }
});
