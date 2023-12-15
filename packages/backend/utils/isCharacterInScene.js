const isCharacterInScene = (game, character) => {
    for (let i = 0; i < game.characters.length; i++) {
        if (
            game.characters[i].character._id.toString() ===
            character._id.toString()
        ) {
            return { ...game.characters[i]._doc };
        }
    }
    return false;
};

export default isCharacterInScene;
