
Page({
    mapState: ['count', 'store_name','store_info'],
    data:{
        name:'张三'
    },
    onLoad(){
        console.log(this)
    },
    toPage(){
        this.$router.go('demo')
    },
    updateStore () {
        this.$store.commit("count", ++this.data.count);
        this.$store.commit("store_name", '修改后的name');
        this.$store.dispatch('asyncSetUserInfo',{
            id:4894654654,
            list:[7,8,9]
        })
    },
});
