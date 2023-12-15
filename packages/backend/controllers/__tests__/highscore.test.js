import request from "supertest";
import express from "express";
const app = express();
import passport from "passport";
import passportJWT from "passport-jwt";
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
import { vi } from "vitest";
import highscore from "../../routes/highscore.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", highscore);

// Verify token
passport.use(
    "jwt",
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: "test",
        },
        (jwt_payload, done) => {
            return done(null, jwt_payload);
        }
    )
);

const checkTokenState = vi.fn(() => {
    return [
        {
            id: new mongoose.Types.ObjectId(),
            dateStarted: Date.now(),
            timeTaken: null,
            gameId: games[0]._id,
            charactersFound: [],
        },
        true,
    ];
});
vi.mock("../../utils/checkTokenState", async () => ({
    default: () => checkTokenState(),
}));

const checkGameWon = vi.fn(() => false);
vi.mock("../../utils/checkGameWon", async () => ({
    default: () => checkGameWon(),
}));

let games, highscores, characters;
beforeAll(async () => {
    [games, highscores, characters] = await initialiseMongoServer();
});

afterAll(() => {
    mongoose.connection.close();
});

describe("Route testing...", () => {
    describe("/game/:gameId/high-scores GET route...", () => {
        test(`Should return status code 400 if provided gameId is not a valid
         MongoDB ObjectId`, async () => {
            const gameId = null;
            await request(app).get(`/${gameId}/high-scores`).expect(400);
        });
        test(`Should return status code 404 if provided gameId is a valid
         MongoDB ObjectId, but the document is not found in the database`, async () => {
            const gameId = new mongoose.Types.ObjectId();
            await request(app).get(`/${gameId}/high-scores`).expect(404);
        });
        test(`Should return status code 200 if the specified game is found in
         the database`, async () => {
            const gameId = games[0]._id;
            await request(app).get(`/${gameId}/high-scores`).expect(200);
        });
        test(`Should also return highscores within response body.data`, async () => {
            const gameId = games[0]._id;
            await request(app)
                .get(`/${gameId}/high-scores`)
                .expect((res) => {
                    const data = res.body.data;
                    if (typeof data !== "object") {
                        throw new Error(
                            `res.body.data was expected to be type 'object', got '${typeof res
                                .body.data}'`
                        );
                    }
                    if (typeof data.highscores !== "object") {
                        throw new Error(
                            `res.body.data.highscores was expected to be type 'array', got '${typeof res
                                .body.data.highscores}'`
                        );
                    }
                    if (data.highscores.length !== 5) {
                        throw new Error(
                            `res.body.data.highscores does not contain the correct number of records: '${res.body.data.highscores.length}', expected 5`
                        );
                    }
                });
        });
    });
    describe("/game/:gameId/high-scores POST route...", () => {
        test(`Should return status code 400 if provided gameId is not a valid
         MongoDB ObjectId`, async () => {
            const gameId = null;
            await request(app).post(`/${gameId}/high-scores`).expect(400);
        });
        test(`Should return status code 404 if provided gameId is a valid
         MongoDB ObjectId, but the document is not found in the database`, async () => {
            const gameId = new mongoose.Types.ObjectId();
            await request(app).post(`/${gameId}/high-scores`).expect(404);
        });
        test(`Should return status code 400 if the specified game is found in
         the database, but the body object in the request object does not
         contain the necessary information`, async () => {
            const gameId = games[0]._id;
            await request(app)
                .post(`/${gameId}/high-scores`)
                .send()
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should return status code 401 if no valid auth token is provided`, async () => {
            const gameId = games[0]._id;
            await request(app)
                .post(`/${gameId}/high-scores`)
                .send({ first_name: "John", last_name: "Smith" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should return status code 400 if game is not yet won`, async () => {
            const gameId = games[0]._id;
            checkTokenState.mockReturnValueOnce([
                {
                    id: new mongoose.Types.ObjectId(),
                    dateStarted: Date.now(),
                    timeTaken: null,
                    gameId: games[0]._id,
                    charactersFound: [],
                },
                false, // Mocking valid token
            ]);
            await request(app)
                .post(`/${gameId}/high-scores`)
                .send({ first_name: "John", last_name: "Smith" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should return status code 400 if provided id in token matches an
         existing high-score within the database`, async () => {
            const gameId = games[0]._id;
            checkTokenState.mockReturnValueOnce([
                {
                    id: highscores[0]._id, // Mocking existing high-score in database
                    dateStarted: Date.now(),
                    timeTaken: null,
                    gameId: games[0]._id,
                    charactersFound: [],
                },
                false, // Mocking valid token
            ]);
            checkGameWon.mockReturnValueOnce(true); // Mocking game being won
            await request(app)
                .post(`/${gameId}/high-scores`)
                .send({ first_name: "John", last_name: "Smith" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should return status code 400 if provided timeTaken value in token
         is not a valid numeric value`, async () => {
            const gameId = games[0]._id;
            checkTokenState.mockReturnValueOnce([
                {
                    id: new mongoose.Types.ObjectId(),
                    dateStarted: Date.now(),
                    timeTaken: null,
                    gameId: games[0]._id,
                    charactersFound: [],
                },
                false, // Mocking valid token
            ]);
            checkGameWon.mockReturnValueOnce(true); // Mocking game being won
            await request(app)
                .post(`/${gameId}/high-scores`)
                .send({ first_name: "John", last_name: "Smith" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should return status code 201 if the high-score is successfully
         submitted to the database`, async () => {
            const gameId = games[0]._id;
            checkTokenState.mockReturnValueOnce([
                {
                    id: new mongoose.Types.ObjectId(),
                    dateStarted: Date.now(),
                    timeTaken: 1000,
                    gameId: games[0]._id,
                    charactersFound: [],
                },
                false, // Mocking valid token
            ]);
            checkGameWon.mockReturnValueOnce(true); // Mocking game being won
            await request(app)
                .post(`/${gameId}/high-scores`)
                .send({ first_name: "John", last_name: "Smith" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(201);
        });
    });
});
