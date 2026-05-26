import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getWater, getWaters } from "../controllers/waterController.js";

export const waterRouter = Router();

waterRouter.get("/", asyncHandler(getWaters));
waterRouter.get("/:id", asyncHandler(getWater));
