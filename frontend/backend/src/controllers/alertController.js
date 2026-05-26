import { createAlert, listAlerts } from "../services/alertService.js";

export async function getAlerts(_req, res) {
  const alerts = await listAlerts();
  res.json(alerts);
}

export async function postAlert(req, res) {
  const alert = await createAlert(req.body);
  res.status(201).json(alert);
}
