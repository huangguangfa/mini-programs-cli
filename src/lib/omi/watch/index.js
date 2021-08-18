/*
 * @Author: gf
 * @Date: 2021-3-8
 * @description:页面data的watch监听
 */
function observe( targetData, key, watch_fn, deep ){
    let oldVal = targetData[key];
    if ( oldVal !== null && oldVal.toString() === "[object Object]" && deep ) {
        Object.keys(oldVal).forEach(  key => {
            observe(oldVal, key, watch_fn, deep)
        })
    }else{
        Object.defineProperty(targetData, key, {
            configurable: true,
            enumerable: true,
            set( value ) {
                if ( value === oldVal ) return;
                watch_fn( value, oldVal, key );
                oldVal = value;
            },
            get() {
                return oldVal;
            }
        })
    }
}

export function initWatcher(option) {
    if( option.$watch && Object.keys( option.$watch ).length ){
        const targetData = option.data;
        const watch_option = option.$watch;
        Object.keys( watch_option ).forEach( key => {
            const watch_fn = watch_option[key].handler || watch_option[key]
            const deep = watch_option[key].deep
            observe( targetData, key, watch_fn, deep )
        })
    }
}