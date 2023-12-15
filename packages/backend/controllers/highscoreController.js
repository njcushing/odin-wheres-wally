import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import createError from "http-errors";
import passport from "passport";

import Game from "../models/game.js";
import HighScore from "../models/highscore.js";

import successfulRequest from "../utils/successfulRequest.js";
import checkTokenState from "../utils/checkTokenState.js";
import checkGameWon from "../utils/checkGameWon.js";

const validateGameId = (next, gameId) => {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        return next(createError(400, `Provided gameId: ${gameId} is invalid.`));
    }
    return true;
};

const compileValidationErrors = (errorsArray) => {
    const reducedErrorArray = [];
    errorsArray.forEach((error) => {
        reducedErrorArray.push(error.msg);
    });
    return reducedErrorArray.join(", ");
};

const gameNotFound = (gameId) => {
    return createError(404, `Specified game not found at: ${gameId}.`);
};

const validateMandatoryFields = [
    body("first_name", "'first_name' field (string) must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("last_name", "'last_name' field (string) must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
];

export const highscoreGet = asyncHandler(async (req, res, next) => {
    const gameId = req.params.gameId;
    if (!validateGameId(next, gameId)) return;
    let game = await Game.findById(gameId)
        .populate({
            path: "highscores",
            options: {
                sort: { time: 1 },
                limit: 10,
            },
        })
        .exec();
    if (game === null) return next(gameNotFound(gameId));
    return successfulRequest(res, 200, "High-Score(s) found", {
        highscores: game.highscores,
    });
});

export const highscorePost = [
    ...validateMandatoryFields,
    asyncHandler(async (req, res, next) => {
        const gameId = req.params.gameId;
        if (!validateGameId(next, gameId)) return;
        let game = await Game.findById(gameId).exec();
        if (game === null) return next(gameNotFound(gameId));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorString = compileValidationErrors(errors.array());
            return next(
                createError(400, `Unable to submit high-score: ${errorString}`)
            );
        }

        // Create new/extract existing token
        passport.authenticate(
            "jwt",
            { session: false },
            async (err, payload, options) => {
                const [token, fresh] = checkTokenState(
                    typeof payload === "object" ? payload.token : {},
                    gameId
                );

                if (fresh) {
                    return next(createError(401, `Invalid auth token.`));
                }

                // Check if game is won
                if (!checkGameWon(game, token)) {
                    return next(
                        createError(400, `The game has not yet been won.`)
                    );
                }

                // Check if high-score with id from token already exists
                const existingHighScore = await HighScore.findById(
                    token.id
                ).exec();
                if (existingHighScore !== null) {
                    return next(
                        createError(
                            400,
                            `You have already submitted this high-score.`
                        )
                    );
                }

                // Get total game time
                if (Number.isNaN(Number.parseInt(token.timeTaken))) {
                    return next(createError(400, `Invalid completion time.`));
                }

                // Submit high-score
                const highscore = new HighScore({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    time: token.timeTaken,
                    date_achieved: Date.now(),
                    _id: token.id,
                });
                const updatedGame = await Game.findByIdAndUpdate(gameId, {
                    $push: { highscores: token.id },
                });
                if (updatedGame === null) {
                    return next(
                        createError(
                            404,
                            `Specified game not found at: ${gameId}. High-Score was not submitted`
                        )
                    );
                } else {
                    await highscore.save();
                    return successfulRequest(
                        res,
                        201,
                        `High-Score submitted`,
                        highscore
                    );
                }
            }
        )(req, res, next);
    }),
];
