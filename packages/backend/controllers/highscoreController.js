import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import createError from "http-errors";

import Game from "../models/game.js";
import HighScore from "../models/highscore.js";

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

const successfulRequest = (res, status, message, data) => {
    return res.status(status).send({
        status: status,
        message: message,
        data: data,
    });
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
    body("time")
        .exists()
        .not()
        .isEmpty()
        .withMessage("'time' field (float) must not be empty")
        .isFloat({ min: 0 })
        .toFloat()
        .withMessage("'time' field (float) must not be less than 0"),
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
    return successfulRequest(res, 200, "High-Score(s) found", game.highscores);
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

        const newHighscoreId = new mongoose.Types.ObjectId();
        const highscore = new HighScore({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            time: req.body.time,
            date_achieved: Date.now(),
            _id: newHighscoreId,
        });

        const updatedGame = await Game.findByIdAndUpdate(gameId, {
            $push: { highscores: newHighscoreId },
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
    }),
];
