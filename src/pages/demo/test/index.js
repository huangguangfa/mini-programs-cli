import create from "@omi/create";
import store from "@/store";

create.Component(store,{
    data:{
        name:'test',
        test:false
    },
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
        // this.setData({test:true},() =>{
        //     console.log('show',this.data.test)
        // })
    },
    methods:{
        updata(){
            this.setData({
                test:!this.data.test
            })
        }
    }
})

