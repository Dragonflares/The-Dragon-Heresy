export const timeDiff = (before, after) => {
    let time = before.getTime() - after.getTime()
    var diffDays = Math.floor(time / 86400000); // days
    var diffHrs = Math.floor((time % 86400000) / 3600000); // hours
    var diffMins = Math.round(((time % 86400000) % 3600000) / 60000); // minutes
    return { diffDays, diffHrs, diffMins };
}

export const getTime = (time) => {
    var diffDays = Math.floor(time / 86400000); // days
    var diffHrs = Math.floor((time % 86400000) / 3600000); // hours
    var diffMins = Math.round(((time % 86400000) % 3600000) / 60000); // minutes
    return { diffDays, diffHrs, diffMins };
}