import convertTimeSecondsToHours from "@/utils/convertTimeSecondsToHours.js";

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
    const time = convertTimeSecondsToHours(seconds);
    return `${time.hours}:${time.minutes}:${time.seconds}`;
};

export const postHighScoreSubmission = () => {
    return;
};
