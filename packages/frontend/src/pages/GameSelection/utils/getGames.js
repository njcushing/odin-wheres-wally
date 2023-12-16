const getGames = async () => {
    const response = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/game`, {
        method: "GET",
        mode: "cors",
    })
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
        return response;
    } else {
        return [];
    }
};

export default getGames;
