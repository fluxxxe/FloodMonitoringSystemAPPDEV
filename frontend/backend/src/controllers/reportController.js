import { createReport, listReports } from "../services/reportService.js";

export async function getReports(_req, res) {
  const reports = await listReports();
  res.json(reports);
}

export async function postReport(req, res) {
  const report = await createReport(req.body);
  res.status(201).json(report);
}
