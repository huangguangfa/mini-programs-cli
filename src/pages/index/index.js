
Page({
    mapState: ['cartCount', 'mark'],
    data:{
        name:'张三'
    },
    onLoad(){
        console.log(this.data)
    },
    toPage(){
        this.$router.go('demo')
    },
    add () {
        let count = this.data.cartCount
        this.$store.commit('cartCount', count + 1)
    },
});
