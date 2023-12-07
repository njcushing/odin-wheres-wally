export const getGameInformation = () => {
    return {
        image: null,
        imageSize: [800, 800],
        characters: ["char_1", "char_2", "char_3", "char_4", "char_5"],
    };
};

export const postCharacterSelection = (character, clickPosition) => {
    return true;
};

export const getGameDuration = () => {
    const startDate = new Date("2023-12-07T14:43:11");
    const endDate = new Date("2023-12-07T14:48:42");
    let seconds = (endDate.getTime() - startDate.getTime()) / 1000;
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes - hours * 60;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds - minutes * 60;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${hours}:${minutes}:${seconds}`;
};
