import Router from "@lib/router";
import route from "./route.json";

// 初始化路由实例
const router = new Router(route);
console.log('router',router)
router.beforeEach = function (to, from, next) {
    if (to.auth) {
        wx._user.check(
            () => {
                next();
            },
            () => {
                next("login");
            }
        );
    } else {
        next();
    }
};

export default router;
