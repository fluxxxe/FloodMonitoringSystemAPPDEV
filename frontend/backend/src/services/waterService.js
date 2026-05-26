import { readCollection } from "./fileStore.js";
import { createHttpError } from "../utils/httpError.js";

const FILE_NAME = "waters.json";

export async function listWaters() {
  return readCollection(FILE_NAME);
}

export async function getWaterById(id) {
  const waters = await listWaters();
  const water = waters.find((entry) => entry.id === id);
  if (!water) {
    throw createHttpError(404, "Water monitoring location not found");
  }
  return water;
}
