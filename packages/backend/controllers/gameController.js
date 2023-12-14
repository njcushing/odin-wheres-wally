import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import passport from "passport";
import jwt from "jsonwebtoken";

import Game from "../models/game.js";

import checkTokenState from "../utils/checkTokenState.js";

const validateGameId = (next, gameId) => {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        return next(createError(400, `Provided gameId: ${gameId} is invalid.`));
    }
    return true;
};

const gameNotFound = (gameId) => {
    return createError(404, `Specified game not found at: ${gameId}.`);
};

const successfulRequest = (res, status, message, data) => {
    return res.status(status).send({
        status: status,
        message: message,
        data: data,
    });
};

export const gameGet = asyncHandler(async (req, res, next) => {
    const gameId = req.params.gameId;
    if (!validateGameId(next, gameId)) return;
    let game = await Game.findById(gameId)
        .populate({ path: "characters", populate: { path: "character" } })
        .exec();
    if (game === null) {
        return next(gameNotFound(gameId));
    } else {
        const charactersTrimmed = [];
        game.characters.forEach((character) => {
            charactersTrimmed.push({
                id: character.character._id,
                name: character.character.name,
                imageUrl: character.character.imageUrl,
            });
        });
        const gameTrimmed = {
            imageUrl: game.imageUrl,
            imageWidth: game.imageWidth,
            imageHeight: game.imageHeight,
            characters: charactersTrimmed,
        };

        // Create new/extract existing token
        passport.authenticate(
            "jwt",
            { session: false },
            (err, payload, options) => {
                const [token, fresh] = checkTokenState(
                    typeof payload === "object" ? payload.token : {},
                    gameId
                );

                // Calculate time taken
                let timeTaken;
                if (!Number.isNaN(Number.parseInt(token.timeTaken))) {
                    timeTaken = token.timeTaken;
                } else if (isNaN(new Date(token.dateStarted))) {
                    return next(createError(400, `Invalid start time.`));
                } else {
                    timeTaken =
                        Date.now() - new Date(token.dateStarted).getTime();
                }

                const charactersFound = [...token.charactersFound];

                jwt.sign(
                    { token },
                    process.env.AUTH_SECRET_KEY,
                    (err, token) => {
                        if (err) {
                            return next(
                                createError(
                                    401,
                                    `Could not create token: ${err}`
                                )
                            );
                        } else {
                            return successfulRequest(res, 200, "Game found", {
                                gameInfo: gameTrimmed,
                                charactersFound: charactersFound,
                                timeTaken: timeTaken,
                                token: `Bearer ${token}`,
                            });
                        }
                    }
                );
            }
        )(req, res, next);
    }
});
