Component({
    data:{
        name:'test',
        test:false
    },
    mapState: ['count', 'store_name','store_info'],
    pageLifetimes:{
        show(){
            console.log(2222)
            this.setData({test:true},() =>{
                console.log('show',this.data.test)
            })
        }
    },
    ready(){
        console.log('show',this.data.test)
    },
    methods:{
        updata(){
            this.setData({
                test:!this.data.test
            })
        },
        toPage(){
            this.$router.go('index')
        }
    }
})

