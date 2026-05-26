import { randomUUID } from "node:crypto";
import { readCollection, writeCollection } from "./fileStore.js";

const FILE_NAME = "reports.json";

export async function listReports() {
  const reports = await readCollection(FILE_NAME);
  return [...reports].sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export async function createReport(input) {
  const reports = await readCollection(FILE_NAME);
  const report = {
    id: randomUUID(),
    reporterName: input.reporterName,
    email: input.email,
    contactNumber: input.contactNumber,
    locationId: input.locationId,
    waterLevel: Number(input.waterLevel),
    incidentType: input.incidentType,
    urgency: input.urgency,
    needsRescue: Boolean(input.needsRescue),
    notifySms: Boolean(input.notifySms),
    notifyEmail: Boolean(input.notifyEmail),
    reportDate: input.reportDate,
    reportTime: input.reportTime,
    notes: input.notes,
    status: "submitted",
    createdAt: new Date().toISOString(),
  };

  reports.unshift(report);
  await writeCollection(FILE_NAME, reports);
  return report;
}
