module.exports = (ms) => {
    if (isNaN(ms)) return "00:00";
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    const hoursStr = (hours < 10) ? "0" + hours : hours;
    const minutesStr = (minutes < 10) ? "0" + minutes : minutes;
    const secondsStr = (seconds < 10) ? "0" + seconds : seconds;

    if (hours > 0) {
        return `${hoursStr}:${minutesStr}:${secondsStr}`;
    } else {
        return `${minutesStr}:${secondsStr}`;
    }
};