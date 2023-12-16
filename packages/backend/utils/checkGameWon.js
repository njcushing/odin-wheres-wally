const checkGameWon = (game, token) => {
    for (let i = 0; i < game.characters.length; i++) {
        if (
            token.charactersFound.filter(
                (c) => c.id === game.characters[i].character._id.toString()
            ).length === 0
        ) {
            return false;
        }
    }
    return true;
};

export default checkGameWon;
