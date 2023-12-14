import mongoose from "mongoose";

const checkTokenState = (extractedJWT, gameId) => {
    let fresh = true;
    const token = {
        id: new mongoose.Types.ObjectId(),
        dateStarted: Date.now(),
        timeTaken: null,
        gameId: gameId,
        charactersFound: [],
    };
    if (typeof extractedJWT === "object") {
        if (
            Object.hasOwn(extractedJWT, "gameId") &&
            extractedJWT.gameId === gameId &&
            Object.hasOwn(extractedJWT, "dateStarted") &&
            Object.hasOwn(extractedJWT, "timeTaken") &&
            Object.hasOwn(extractedJWT, "id") &&
            Object.hasOwn(extractedJWT, "charactersFound")
        ) {
            token.dateStarted = extractedJWT.dateStarted;
            token.timeTaken = extractedJWT.timeTaken;
            token.id = extractedJWT.id;
            token.charactersFound = extractedJWT.charactersFound;
            fresh = false;
        }
    }
    return [token, fresh];
};

export default checkTokenState;
