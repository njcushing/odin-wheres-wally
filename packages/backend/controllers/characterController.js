import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import createError from "http-errors";

import Game from "../models/game.js";
import Character from "../models/character.js";

export const validateDocumentIds = (next, gameId, characterId) => {
    const validGameId = mongoose.Types.ObjectId.isValid(gameId);
    const validCharacterId = mongoose.Types.ObjectId.isValid(characterId);
    if (!validGameId || !validCharacterId) {
        return next(
            createError(
                400,
                `${
                    !validGameId && !validCharacterId
                        ? `Provided gameId: ${gameId} and characterId: ${characterId} are both invalid.`
                        : !validGameId
                        ? `Provided gameId: ${gameId} is invalid.`
                        : `Provided characterId: ${characterId} is invalid.`
                }`
            )
        );
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

const characterNotFound = (characterId) => {
    return createError(
        404,
        `Specified character not found at: ${characterId}.`
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

export const characterCheckPosition = [
    ...validateMandatoryFields,
    asyncHandler(async (req, res, next) => {
        const gameId = req.params.gameId;
        const characterId = req.params.characterId;
        if (!validateDocumentIds(next, gameId, characterId)) return;
        let game = await Game.findById(gameId).exec();
        let character = await Character.findById(characterId).exec();
        if (game === null) return next(gameNotFound(gameId));
        if (character === null) return next(characterNotFound(characterId));

        let characterInScene = false;
        let charInfo;
        for (let i = 0; i < game.characters.length; i++) {
            if (game.characters[i].character.toString() === characterId) {
                characterInScene = true;
                charInfo = { ...game.characters[i]._doc };
                continue;
            }
        }
        if (!characterInScene) {
            return createError(
                404,
                `Specified character exists at: ${characterId}, but it is not
                present in the current scene.`
            );
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorString = compileValidationErrors(errors.array());
            return next(
                createError(400, `Unable to validate character: ${errorString}`)
            );
        } else {
            // Perform rectangle intersection calculation
            const boxSize = [72, 72];

            const clickLeft = req.body.click_position[0] - boxSize[0] / 2;
            const clickRight = req.body.click_position[0] + boxSize[0] / 2;
            const clickTop = req.body.click_position[1] - boxSize[1] / 2;
            const clickBottom = req.body.click_position[1] + boxSize[1] / 2;

            const characterLeft = charInfo.positionX - charInfo.width / 2;
            const characterRight = charInfo.positionX + charInfo.width / 2;
            const characterTop = charInfo.positionY - charInfo.height / 2;
            const characterBottom = charInfo.positionY + charInfo.height / 2;

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
                        position: [charInfo.positionX, charInfo.positionY],
                        width: charInfo.width,
                        height: charInfo.height,
                    }
                );
            }
        }
    }),
];