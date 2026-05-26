import { Router } from "express";
import { getReports, postReport } from "../controllers/reportController.js";
import { requireFields } from "../middlewares/validateBody.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reportRouter = Router();

reportRouter.get("/", asyncHandler(getReports));
reportRouter.post(
  "/",
  requireFields([
    "reporterName",
    "email",
    "contactNumber",
    "locationId",
    "waterLevel",
    "incidentType",
    "urgency",
    "reportDate",
    "reportTime",
    "notes",
  ]),
  asyncHandler(postReport),
);
