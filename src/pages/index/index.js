
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
        "test.a":{
            handler(newName, oldName) {
               console.log('变化了',newName, oldName)
            }
        },
        name(){
            console.log('变化了')
        },
        list(){
            console.log('变化了List')
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
            name:'李四'
            // ['test.a']:'测试111111111111111111'
        })
    }
});
