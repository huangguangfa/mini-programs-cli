import create from "@omi/create";
import store from "@/store/index";

create.Page(store, {
    use: ["reservation.type","reservation.info.name"],
    data:{
        name:'demo'
    },
    onLoad(){
        console.log('this',this)
    },
    updateStore(){
        this.store.data.reservation.type = '修改后的test'
        // this.store.data.reservation.info.name = '修改后的李四'
    }
});
