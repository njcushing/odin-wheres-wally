import convertTimeSecondsToHours from "@/utils/convertTimeSecondsToHours.js";

export const getGameInformation = async () => {
    const gameInfo = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/game/6572fc2d12becab50ff4f90f`,
        {
            method: "GET",
            mode: "cors",
        }
    )
        .then((response) => {
            if (response.status >= 400) {
                throw new Error(`Request error: status ${response.status}`);
            } else {
                return response.json();
            }
        })
        .then((response) => response.data)
        .catch((error) => {
            throw new Error(error);
        });
    if (gameInfo) {
        return {
            imageUrl: gameInfo.imageUrl,
            imageSize: [gameInfo.imageWidth, gameInfo.imageHeight],
            characters: gameInfo.characters,
        };
    } else {
        return null;
    }
};

export const postCharacterSelection = async (characterName, clickPosition) => {
    const body = {
        character_name: characterName,
        click_position: clickPosition,
    };

    return await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/game/6572fc2d12becab50ff4f90f`,
        {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }
    )
        .then((response) => {
            if (response.status >= 400) {
                throw new Error(`Request error: status ${response.status}`);
            } else {
                return response.json();
            }
        })
        .then((response) => response.data)
        .catch((error) => {
            throw new Error(error);
        });
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
