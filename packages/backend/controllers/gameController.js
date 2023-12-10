import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import createError from "http-errors";

import Game from "../models/game.js";

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

const characterNotFound = (characterName) => {
    return createError(
        404,
        `Specified character not found at: ${characterName}.`
    );
};

const successfulRequest = (res, status, message, data) => {
    return res.status(status).send({
        status: status,
        message: message,
        data: data,
    });
};

const validateMandatoryFields = [
    body("character_name", "'character_name' field (string) must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("click_position")
        .trim()
        .custom((value) => {
            const errorMessage =
                "'click_position_topleft' field must be an array, length 2, with float values";
            if (!Array.isArray(value)) throw new Error(errorMessage);
            if (value.length !== 2) throw new Error(errorMessage);

            value[0] = Number.parseFloat(value[0]);
            value[1] = Number.parseFloat(value[1]);

            if (Number.isNaN(value[0])) throw new Error(errorMessage);
            if (Number.isNaN(value[1])) throw new Error(errorMessage);

            return true;
        }),
];

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
        return successfulRequest(res, 200, "Game found", gameTrimmed);
    }
});

export const gamePost = [
    ...validateMandatoryFields,
    asyncHandler(async (req, res, next) => {
        const gameId = req.params.gameId;
        if (!validateGameId(next, gameId)) return;
        let game = await Game.findById(gameId)
            .populate({ path: "characters", populate: { path: "character" } })
            .exec();
        if (game === null) return next(gameNotFound(gameId));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorString = compileValidationErrors(errors.array());
            return next(
                createError(400, `Unable to validate character: ${errorString}`)
            );
        } else {
            // Find character in game
            let character = null;
            let _i = 0;
            while (!character && _i < game.characters.length) {
                if (
                    game.characters[_i].character.name ===
                    req.body.character_name
                ) {
                    character = game.characters[_i];
                }
                _i++;
            }
            if (!character) {
                return next(characterNotFound(req.body.character_name));
            }

            // Perform rectangle intersection calculation
            const boxSize = [72, 72];

            const clickLeft = req.body.click_position[0] - boxSize[0] / 2;
            const clickRight = req.body.click_position[0] + boxSize[0] / 2;
            const clickTop = req.body.click_position[1] - boxSize[1] / 2;
            const clickBottom = req.body.click_position[1] + boxSize[1] / 2;

            const characterLeft = character.positionX - character.width / 2;
            const characterRight = character.positionX + character.width / 2;
            const characterTop = character.positionY - character.height / 2;
            const characterBottom = character.positionY + character.height / 2;

            let contains = !(
                characterLeft < clickLeft ||
                characterTop < clickTop ||
                characterRight > clickRight ||
                characterBottom > clickBottom
            );

            let overlaps = true;
            if (
                clickLeft >= characterRight ||
                characterLeft >= clickRight ||
                clickTop >= characterBottom ||
                characterTop >= clickBottom
            ) {
                overlaps = false;
            }

            let touches = true;
            if (
                clickLeft > characterRight ||
                characterLeft > clickRight ||
                clickTop > characterBottom ||
                characterTop > clickBottom
            ) {
                touches = false;
            }

            // Respond
            if (!contains && !overlaps && !touches) {
                return successfulRequest(
                    res,
                    200,
                    "Character not at location",
                    {
                        success: false,
                        position: null,
                        width: null,
                        height: null,
                    }
                );
            } else {
                return successfulRequest(
                    res,
                    200,
                    "Character found at location",
                    {
                        success: true,
                        position: [character.positionX, character.positionY],
                        width: character.width,
                        height: character.height,
                    }
                );
            }
        }
    }),
];
