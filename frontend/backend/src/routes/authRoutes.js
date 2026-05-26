import { Router } from "express";
import { postLogin } from "../controllers/authController.js";
import { requireFields } from "../middlewares/validateBody.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/login", requireFields(["email", "password"]), asyncHandler(postLogin));
