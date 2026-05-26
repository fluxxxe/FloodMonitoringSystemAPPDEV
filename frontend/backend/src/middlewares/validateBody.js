import { createHttpError } from "../utils/httpError.js";

function isMissing(value) {
  return value === undefined || value === null || value === "";
}

export function requireFields(fields) {
  return (req, _res, next) => {
    const missingFields = fields.filter((field) => isMissing(req.body?.[field]));
    if (missingFields.length > 0) {
      next(createHttpError(400, "Missing required fields", { missingFields }));
      return;
    }

    next();
  };
}
