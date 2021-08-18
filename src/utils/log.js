/**
 * 错误日志上报
 * @param {*} obj
 * @param {*} key
 */
 export const RLogWarn = (obj, key) => {
    const RLog = wx?.getRealtimeLogManager() || {
        warn() {},
        info() {},
        error() {},
    };
    if (!RLog?.setFilterMsg) return;
    if (key) {
        RLog.setFilterMsg(key);
    }
    RLog.warn(obj);
}
