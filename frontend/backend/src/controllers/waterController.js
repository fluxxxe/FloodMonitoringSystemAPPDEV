import { getWaterById, listWaters } from "../services/waterService.js";

export async function getWaters(_req, res) {
  const waters = await listWaters();
  res.json(waters);
}

export async function getWater(req, res) {
  const water = await getWaterById(req.params.id);
  res.json(water);
}
