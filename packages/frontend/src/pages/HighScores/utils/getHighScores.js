const getHighScores = async () => {
    const response = await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/game/6572fc2d12becab50ff4f90f/high-scores`,
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
    if (response) {
        return response.highscores;
    } else {
        return [];
    }
};

export default getHighScores;
