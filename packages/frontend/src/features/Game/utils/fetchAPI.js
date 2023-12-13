import convertTimeSecondsToHours from "@/utils/convertTimeSecondsToHours.js";

export const getGameInformation = async (restarting) => {
    if (restarting) localStorage.removeItem("authToken");

    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/game/6572fc2d12becab50ff4f90f`,
        {
            method: "GET",
            mode: "cors",
            headers: {
                authorization: localStorage.getItem("authToken"),
            },
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
    if (data) {
        localStorage.setItem("authToken", data.token);
        return {
            gameInfo: {
                imageUrl: data.gameInfo.imageUrl,
                imageSize: [
                    data.gameInfo.imageWidth,
                    data.gameInfo.imageHeight,
                ],
                characters: data.gameInfo.characters,
            },
            charactersFound: data.charactersFound,
        };
    } else {
        return null;
    }
};

export const postCharacterSelection = async (characterId, clickPosition) => {
    const body = {
        click_position: clickPosition,
    };

    return await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/game/6572fc2d12becab50ff4f90f/character/${characterId}/check-position`,
        {
            method: "POST",
            mode: "cors",
            headers: {
                authorization: localStorage.getItem("authToken"),
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
        .then((response) => {
            localStorage.setItem("authToken", response.data.token);
            return response.data.selectionResponse;
        })
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

export const postHighScoreSubmission = async (firstName, lastName) => {
    const body = {
        first_name: firstName,
        last_name: lastName,
    };

    return await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/game/6572fc2d12becab50ff4f90f/high-scores`,
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
