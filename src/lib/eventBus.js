/**
 * 全局事件总线
 */
export class EventBus {
    constructor() {
        this.event = {};
    }
    // 广播事件
    $emit(eventName, ...eventData) {
        if (!this.event[eventName]) return;
        this.event[eventName].forEach((handler) => {
            try {
                handler.call(this, ...eventData);
            } catch (e) {
                console.log("$emit faild", e);
            }
        });
    }

    /**
     * @param {string} eventName 事件名称
     * @param {function} handler 回调函数
     * @return {function} 解绑监听的方法
     */
    $on(eventName, handler) {
        if (typeof handler !== "function") return false;
        this.event[eventName] = this.event[eventName] || [];
        this.event[eventName].push(handler);
        // 返回解绑当前监听的方法
        return () => {
            this.$off(eventName, handler);
        };
    }
    /**
     * @param {string} eventName 事件名称
     * @param {function} handler? 回调函数，非必填，传入则只解绑对应的事件回调，否则清空所有事件
     */
    $off(eventName, handler) {
        let event = this.event[eventName];
        if (!event || !event.length) return true;
        if (typeof handler !== "function") {
            event.splice(0);
            return true;
        }
        // 根据传入函数解绑事件
        for (let i = event.length - 1; i >= 0; i--) {
            let handlerx = event[i];
            if (handlerx === handler) {
                event.splice(i, 1);
            }
        }

        return true;
    }
}

const $eventBus = new EventBus();
export default $eventBus;