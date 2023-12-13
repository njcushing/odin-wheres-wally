import dotenv from "dotenv";
dotenv.config();

import createError from "http-errors";
import express from "express";
import cors from "cors";
import passport from "passport";
import passportJWT from "passport-jwt";
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
import { fileURLToPath } from "url";
import path from "path";
import logger from "morgan";
import RateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";

// Set up mongoose connection
import mongoose from "mongoose";
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI || null;
main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
}

var app = express();

const limiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000,
});
app.use(limiter);

app.use(helmet());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Verify token
passport.use(
    "jwt",
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.AUTH_SECRET_KEY,
        },
        (jwt_payload, done) => {
            return done(null, jwt_payload);
        }
    )
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(compression());

// CORS config
const trusted_domains = process.env.TRUSTED_DOMAINS || [];
const getCorsOpts = (req, callback) => {
    let corsOpts;
    if (trusted_domains.includes(req.header("Origin"))) {
        corsOpts = { origin: true };
    } else {
        corsOpts = { origin: false };
    }
    callback(null, corsOpts);
};
app.use("*", cors(getCorsOpts));

import * as routes from "./routes/index.js";
app.use("/", routes.index);
app.use("/game", routes.game);
app.use("/game", routes.character);
app.use("/game", routes.highscore);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // send error
    res.status(err.status || 500);
    if (req.app.get("env") === "development") {
        res.send(`${err.status} - ${err.stack}`);
    } else {
        res.send({ status: err.status, message: err.message, data: null });
    }
});

export default app;
