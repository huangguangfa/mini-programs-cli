/*
 * @Author: gf
 * @Date: 2021-3-8
 * @description:页面data的watch监听
 */
function observe( targetData, key, userDef ){
    let oldVal = targetData[key];
    Object.defineProperty(targetData, key, {
        configurable: true,
        enumerable: true,
        set( value ) {
            if ( value === oldVal ) return;
            userDef( value, oldVal, key );
            oldVal = value;
        },
        get() {
            return oldVal;
        }
    })
}

export function initWatcher(option) {
    if( option.watch && Object.keys( option.watch ).length ){
        const watch_option = option.watch;
        Object.keys( watch_option ).forEach( key => {
            let [ targetKey, proKey ] = key.includes(".")
                ? key.split('.')
                : [ null, key ];
            let targetObject = targetKey === null ? option.data : option.data[targetKey];
            let value = targetObject[proKey]
            const { handler, immediate } = watch_option[key];
            const userDef = handler ?? watch_option[key];
            immediate && watchKey && userDef(value);
            observe( targetObject, proKey, userDef )
        })
    }
}