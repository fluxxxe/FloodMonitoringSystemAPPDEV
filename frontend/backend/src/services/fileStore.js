import { promises as fs } from "node:fs";
import path from "node:path";
import { dataDirectory } from "../utils/paths.js";

async function ensureDirectory() {
  await fs.mkdir(dataDirectory, { recursive: true });
}

async function ensureFile(filePath, fallbackData) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallbackData, null, 2));
  }
}

export async function readCollection(fileName, fallbackData = []) {
  await ensureDirectory();
  const filePath = path.join(dataDirectory, fileName);
  await ensureFile(filePath, fallbackData);
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

export async function writeCollection(fileName, records) {
  await ensureDirectory();
  const filePath = path.join(dataDirectory, fileName);
  await fs.writeFile(filePath, JSON.stringify(records, null, 2));
}
