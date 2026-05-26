import { randomUUID } from "node:crypto";
import { readCollection, writeCollection } from "./fileStore.js";

const FILE_NAME = "alerts.json";

export async function listAlerts() {
  const alerts = await readCollection(FILE_NAME);
  return [...alerts].sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export async function createAlert(input) {
  const alerts = await readCollection(FILE_NAME);
  const alert = {
    id: randomUUID(),
    title: input.title,
    message: input.message,
    type: input.type,
    source: input.source || "manual",
    createdAt: new Date().toISOString(),
  };

  alerts.unshift(alert);
  await writeCollection(FILE_NAME, alerts);
  return alert;
}
