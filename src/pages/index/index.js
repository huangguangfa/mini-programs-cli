import create from "@omi/create";
import store from "@/store/index";
create.Page(store, {
    data:{
        name:'张三'
    },
    toPage(){
        this.$router.go('demo')
    }
});
