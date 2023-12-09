import express from "express";
const router = express.Router();

import * as controller from "../controllers/gameController.js";

router.get("/:gameId", controller.gameGet);
router.post("/:gameId", controller.gamePost);

export default router;
