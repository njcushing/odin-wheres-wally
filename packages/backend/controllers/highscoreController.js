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
    // ...
];

export const highscoreGet = asyncHandler(async (req, res, next) => {
    return successfulRequest(res, 200, "High Score(s) found", null);
});

export const highscorePost = asyncHandler(async (req, res, next) => {
    return successfulRequest(res, 200, "High Score submitted", null);
});
