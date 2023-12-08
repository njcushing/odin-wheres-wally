import express from "express";
const router = express.Router();

import game from "./game.js";

router.get("/", (req, res) => {
    res.send("");
});

export { router as index, game };
