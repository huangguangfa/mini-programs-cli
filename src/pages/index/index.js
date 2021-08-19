
Page({
    mapState: ['count', 'store_name','store_info'],
    data:{
        name:'张三',
        test:{
            n:'张1111',
            a:'1997'
        }
    },
    onLoad(){
        console.log(this)
    },
    toPage(){
        this.$router.go('demo')
    },
    watch:{
        name(newVal){
            console.log(newVal)
        }
    },
    updateStore () {
        this.setData({
            ['test.a']:'测试111111111111111111'
        })
        // this.$store.commit("count", ++this.data.count);
        // this.$store.commit("store_name", '修改后的name');
        // this.$store.dispatch('asyncSetUserInfo',{
        //     id:4894654654,
        //     list:[7,8,9]
        // })
    },
});
