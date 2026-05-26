import { Router } from "express";
import { getUsers, postUser } from "../controllers/userController.js";
import { requireFields } from "../middlewares/validateBody.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const userRouter = Router();

userRouter.get("/", asyncHandler(getUsers));
userRouter.post("/", requireFields(["name", "email", "password"]), asyncHandler(postUser));
