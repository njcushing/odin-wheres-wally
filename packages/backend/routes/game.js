import express from "express";
const router = express.Router();

import * as controller from "../controllers/gameController.js";

router.get("/", controller.gamesGet);
router.get("/:gameId", controller.gameGet);

export default router;
