import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import createError from "http-errors";
import passport from "passport";
import jwt from "jsonwebtoken";

import Game from "../models/game.js";
import Character from "../models/character.js";

import successfulRequest from "../utils/successfulRequest.js";
import isCharacterInScene from "../utils/isCharacterInScene.js";
import checkTokenState from "../utils/checkTokenState.js";
import checkGameWon from "../utils/checkGameWon.js";

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
        let game = await Game.findById(gameId)
            .populate({ path: "characters", populate: { path: "character" } })
            .exec();
        let character = await Character.findById(characterId).exec();
        if (game === null) return next(gameNotFound(gameId));
        if (character === null) return next(characterNotFound(characterId));

        const charInfo = isCharacterInScene(game, character);
        if (!charInfo) {
            return next(
                createError(
                    404,
                    `Specified character exists at: ${character._id}, but it is
                    not present in the current scene.`
                )
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

            // Create new/extract existing token
            passport.authenticate(
                "jwt",
                { session: false },
                (err, payload, options) => {
                    const [token, fresh] = checkTokenState(
                        typeof payload === "object" ? payload.token : {},
                        gameId
                    );

                    // Check if character has already been found
                    for (let i = 0; i < token.charactersFound.length; i++) {
                        if (token.charactersFound[i].id === characterId) {
                            return next(
                                createError(
                                    400,
                                    `Character: ${characterId} has already been found`
                                )
                            );
                        }
                    }

                    // Add new character info to token array if found
                    let success = false;
                    if (contains || overlaps || touches) {
                        token.charactersFound.push({
                            id: characterId,
                            position: [charInfo.positionX, charInfo.positionY],
                            width: charInfo.width,
                            height: charInfo.height,
                        });
                        success = true;
                    }

                    const finished = checkGameWon(game, token);

                    // Calculate time taken
                    let timeTaken;
                    if (!Number.isNaN(Number.parseInt(token.timeTaken))) {
                        timeTaken = token.timeTaken;
                    } else if (isNaN(new Date(token.dateStarted))) {
                        return next(createError(400, `Invalid start time.`));
                    } else {
                        timeTaken =
                            Date.now() - new Date(token.dateStarted).getTime();
                        if (finished) token.timeTaken = timeTaken;
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
                                return successfulRequest(
                                    res,
                                    200,
                                    success
                                        ? "Character found at location"
                                        : "Character not at location",
                                    {
                                        selectionResponse: {
                                            success: success,
                                            charactersFound: charactersFound,
                                            timeTaken: timeTaken,
                                        },
                                        token: `Bearer ${token}`,
                                    }
                                );
                            }
                        }
                    );
                }
            )(req, res, next);
        }
    }),
];
