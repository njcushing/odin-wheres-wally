import mongoose from "mongoose";

const checkTokenState = (extractedJWT, gameId) => {
    const token = {
        id: new mongoose.Types.ObjectId(),
        dateStarted: Date.now(),
        gameId: gameId,
        charactersFound: [],
    };
    if (typeof extractedJWT === "object") {
        if (
            Object.hasOwn(extractedJWT, "gameId") &&
            extractedJWT.gameId === gameId
        ) {
            if (Object.hasOwn(extractedJWT, "dateStarted")) {
                token.dateStarted = extractedJWT.dateStarted;
            }
            if (Object.hasOwn(extractedJWT, "id")) {
                token.id = extractedJWT.id;
            }
            if (Object.hasOwn(extractedJWT, "charactersFound")) {
                token.charactersFound = extractedJWT.charactersFound;
            }
        }
    }
    return token;
};

export default checkTokenState;
