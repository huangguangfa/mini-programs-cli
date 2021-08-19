export const formatDiffDateToString = (time, nowTime) => {
    // 时间展示规则
    // 1分钟以内，展示刚刚
    // 1分钟以上1小时以内展示X分钟前
    // 1小时以上24小时以内的展示X小时前
    // 24小时以上本能内的展示X天前
    if (!time ) return;
    const timestampSubtract = (nowTime ? +new Date(nowTime.replace(/\-/g, '/')) : +new Date()) - new Date(time.replace(/\-/g, '/'));
    const timestampSecond = parseInt(timestampSubtract / 1000);

    if (timestampSecond < 60) {
        return '刚刚';
    } else if (timestampSecond >= 60 && timestampSecond < 60 * 60) {
        const timestampMinute = parseInt(timestampSecond / 60);
        return `${timestampMinute}分钟前`;
    } else if (timestampSecond >= 60 * 60 && timestampSecond < 60 * 60 * 24) {
        const timestampHour = parseInt(timestampSecond / 60 / 60);
        return `${timestampHour}小时前`;
    } else {
        const timestampDay = parseInt(timestampSecond / 60 / 60 / 24);
        return `${timestampDay}天前`;
    }
};