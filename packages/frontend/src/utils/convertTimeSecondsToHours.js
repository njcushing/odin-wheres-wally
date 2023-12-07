const convertTimeSecondsToHours = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes - hours * 60;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds - minutes * 60;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
    };
};

export default convertTimeSecondsToHours;
