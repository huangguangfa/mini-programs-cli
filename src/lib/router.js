let formatRoute = Symbol("formatRoute");
let staticGo = Symbol("go");
let getTargetByPath = Symbol("getTargetByPath");
let getTargetByName = Symbol("getTargetByName");
let isTabbar = Symbol("isTabbar");
let queryString2Query = Symbol("queryString2Query");
let getQueryString = Symbol("getQueryString");
let setOptions = Symbol("setOptions");
let resetOptions = Symbol("resetOptions");
let delOptions = Symbol("delOptions");
let pathToRoute = Symbol("pathToRoute");

/**
 * 封装路由类
 *
 * 在Page拦截方法中引入并且挂在到每个页面的this上和wx._route上
 *
 * @tip 页面参数有两种query和params，前者是传递简单类型参数，后者传递对象参数
 * @method
 *  beforeEach  钩子函数在引入时设置，可以处理一些页面跳转逻辑，与vue-router类似
 *  staticGo    页面前进方法，会自动判断tabbar和普通页面
 *  replace     页面重定向方法，当前页面会删除与redirectTo类似
 *  back        页面后退与navigateBack类似
 *  relaunch    重启app与reLaunch类似
 *  pageUnload  页面被卸载调用，同时维护路由被打开的页面name列表
 *  pageOnload  页面被装载调用，同时维护路由被打开的页面name列表和当前打开动作
 *  getParams   获取页面params
 *  getQuery    获取页面Query
 *  getOptions  获取页面参数 {query,params}
 */

class Router {
    constructor(options) {
        let route = this[formatRoute](options.pages);
        // 路径对应map {path:route}
        this.pathMap = route.path;
        // name对应map {name:route}
        this.nameMap = route.map;
        // 页面传参中转变量
        this.pageParams = {};
        this.pageQuery = {};
        // 当前进入页面的名称
        this.name = [];
        // 当前页面切换时使用的方式，用来处理页面unload时参数的清理
        this.actionType = "";
        // 保存最后一个被打开的路由信息，用来对tabbar切换时传参信息的处理
        this.lastRoute;
    }
    // 格式化route对象
    [formatRoute](route, root = "", inSub = false, path = {}, name = "") {
        let map = {};
        const addNormalPage = (route, root, name) => {
            let page = {
                ...route,
            };
            if (name) {
                page.fullName = `${name}.${route.name}`;
            }
            page.path = `${root}/${route.path}`;
            path[page.path] = page;
            return page;
        };
        route.forEach((r) => {
            if (map[r.name]) {
                return console.error(`${r.name}-${r.path || r.root} 路由命名有冲突`);
            }
            if (r.isSub) {
                let _root = `${root}/${r.root}`;
                map[r.name] = this[formatRoute](r.pages, _root, true, path, name ? `${name}.${r.name}` : r.name).map;
            } else {
                map[r.name] = {
                    ...addNormalPage(r, inSub ? root : "/pages", name),
                };
            }
        });
        return { map, path };
    }
    // 调用钩子
    beforeEach(to, from, next) {
        next();
    }
    /**
     * 内部跳转页面方法,自动判断switchTab，redirectTo,navigateTo
     * @param {String} name 跳转页面name
     * @param {Object} options 跳转入参
     * @param {String} type 跳转类型 [go:往前进, replace:重定向] 默认go
     *
     */
    [staticGo](name, options, type = "go") {
        this.actionType = "normal";
        return new Promise((resolve, reject) => {
            let current = this[getTargetByPath]();
            let target = this[getTargetByName](name);
            if (!target) {
                console.error(`未找到该页面信息 page[${name}]`);
                return;
            }
            let bIsTabbar = this[isTabbar](target);
            this.beforeEach(target, current, (_name) => {
                if (typeof _name === "boolean" && !_name) return;
                if (_name) {
                    target = this[getTargetByName](_name);
                    name = _name;
                }
                this[setOptions](options, name);
                let query = this[getQueryString](options);
                // 若重定向目标为tabbar直接进入tabbar跳转方法
                if (bIsTabbar) {
                    this.name = [name];
                    this[resetOptions]();
                    this[setOptions](options, name);
                    this.actionType = "switchTab";
                    wx.switchTab({
                        url: target.path + query,
                        success: () => {
                            resolve();
                        },
                        fail: () => {
                            reject();
                        },
                    });
                } else if (type === "replace") {
                    this.actionType = "replace";
                    // 重定向时目标地址与当前地址不相同时删除该name的参数
                    if (current.name !== name) {
                        this[delOptions](current.name);
                    }
                    this.name[this.name.length - 1] = name;
                    wx.redirectTo({
                        url: target.path + query,
                        success: (result) => {
                            resolve();
                        },
                        fail: () => {
                            reject();
                        },
                    });
                } else {
                    this.name.push(name);
                    wx.navigateTo({
                        url: target.path + query,
                        success: () => {
                            resolve();
                        },
                        fail: () => {
                            reject();
                        },
                    });
                }
            });
        });
    }
    // 获取path的route信息，默认返回当前页面
    [getTargetByPath](path) {
        if (path) {
            return this.pathMap[`/${path}`];
        }
        let pages = getCurrentPages();
        let page = pages[pages.length - 1];
        return this.pathMap[`/${page.route}`];
    }
    // 按照name获取对应的目标route信息
    [getTargetByName](name) {
        let names = name.split(".");
        return names.reduce((target, key) => {
            return target[key];
        }, this.nameMap);
    }
    // 是否是tabbar
    [isTabbar](route) {
        return route.isTabbar;
    }
    // 获取query字符串（拼接到url后面）
    [getQueryString](options) {
        let query = "";
        if (options && options.query) {
            query +=
                "?" +
                Object.keys(options.query).reduce((s, k) => {
                    return s ? (s += `&${k}=${options.query[k]}`) : (s += `${k}=${options.query[k]}`);
                }, "");
        }
        return query;
    }
    // 设置页面参数
    [setOptions](options, name) {
        if (options && options.params) {
            this.pageParams[name] = options.params;
        }
        if (options && options.query) {
            this.pageQuery[name] = options.query;
        }
    }
    // 重置router参数对象
    [resetOptions]() {
        this.pageParams = {};
        this.pageQuery = {};
    }
    // 按照页面名称删除页面相关传参
    [delOptions](name) {
        delete this.pageParams[name];
        delete this.pageQuery[name];
    }
    [queryString2Query](string) {
        let query = {};
        if (string) {
            let qMap = string.split("&");
            qMap.forEach((s) => {
                let sArr = s.split("=");
                query[sArr[0]] = sArr[1];
            });
        }
        return query;
    }
    [pathToRoute](target) {
        if (target.indexOf("/page") >= 0) {
            let path = target.split("?");
            let route = this.pathMap[path[0]];
            if (!route) {
                console.error(`未找到该页面信息 [${path[0]}]`);
                return;
            }
            let query = this[queryString2Query](path[1] || "");
            return {
                name: route.fullName || route.name,
                options: {
                    query: query,
                },
            };
        }
        return {
            name: target,
        };
    }
    go(name, options) {
        if (!name) {
            console.error(`请传入正确的跳转目标页面`);
            return;
        }
        let target = this[pathToRoute](name);
        return this[staticGo](target.name, target.options || options);
    }
    replace(name, options) {
        let target = this[pathToRoute](name);
        return this[staticGo](target.name, target.options || options, "replace");
    }
    back(n = 1) {
        let current = this[getTargetByPath]();
        // let currentRoute = this.pathMap[`${current.path}`];
        // this[delOptions](current.name);
        // let name = this.name;
        for (let i = 0; i < n - 1; i++) {
            let name = this.name.pop();
            this[delOptions](name);
        }
        wx.navigateBack({
            delta: n,
        });
    }
    relaunch(name, options) {
        let target = this[getTargetByName](name);
        this[resetOptions]();
        let query = this[getQueryString](options);
        this[setOptions](options, name);
        this.actionType = "relaunch";
        wx.reLaunch({
            url: target.path + query,
            success: (result) => {},
            fail: () => {},
            complete: () => {},
        });
    }
    // 给用户类调用的刷新页面方法
    refreshPage() {
        let current = this[getTargetByPath]();
        let pages = getCurrentPages();
        let page = pages[pages.length - 1];
        let options = Object.assign({}, { query: page.options || {} }, { params: this.getParams() });
        if (current.isTabbar) {
            this.relaunch(current.name, options);
        } else {
            this.replace(current.name, options);
        }
    }
    // 页面被卸载调用，同时维护路由被打开的页面name列表
    pageUnload() {
        let delOptionsArray = ["normal"];
        if (delOptionsArray.includes(this.actionType)) {
            let name = this.name.pop();
            this[delOptions](name);
        }
    }
    // 页面被装载调用，同时维护路由被打开的页面name列表和当前打开动作
    pageOnload() {
        let route = this[getTargetByPath]();
        let lastRoute = this.lastRoute;
        this.lastRoute = route;
        if (route.isTabbar) {
            if (lastRoute && lastRoute.isTabbar) {
                this[delOptions](lastRoute.fullName || lastRoute.name);
            }
            this.name = [route.fullName || route.name];
            this.actionType = "switchTab";
        } else if (this.name.length === 0) {
            this.name = [route.fullName || route.name];
            this.actionType = "normal";
        }
    }
    // 获取页面params
    getParams() {
        if (this.name.length) {
            return this.pageParams[this.name[this.name.length - 1]];
        }
        return;
    }
    // 获取页面query
    getQuery() {
        if (this.name.length) {
            return this.pageQuery[this.name[this.name.length - 1]];
        }
        return;
    }
    // 获取页面参数 {query,params}
    getOptions() {
        if (this.name.length) {
            return {
                params: this.pageParams[this.name[this.name.length - 1]],
                query: this.pageQuery[this.name[this.name.length - 1]],
            };
        }
        return {};
    }
}

export default Router;