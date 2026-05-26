import { Router } from "express";
import { getAlerts, postAlert } from "../controllers/alertController.js";
import { requireFields } from "../middlewares/validateBody.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const alertRouter = Router();

alertRouter.get("/", asyncHandler(getAlerts));
alertRouter.post("/", requireFields(["title", "message", "type"]), asyncHandler(postAlert));
