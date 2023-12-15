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

let games, characters, highscores;
beforeAll(async () => {
    [games, characters, highscores] = await initialiseMongoServer();
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
});
