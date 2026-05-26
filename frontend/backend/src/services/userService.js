import { randomUUID } from "node:crypto";
import { readCollection, writeCollection } from "./fileStore.js";
import { createHttpError } from "../utils/httpError.js";

const FILE_NAME = "users.json";

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function listUsers() {
  const users = await readCollection(FILE_NAME);
  return users.map(sanitizeUser);
}

export async function createUser(input) {
  const users = await readCollection(FILE_NAME);
  const email = String(input.email).trim().toLowerCase();
  const existingUser = users.find((entry) => entry.email.toLowerCase() === email);

  if (existingUser) {
    throw createHttpError(409, "A user with this email already exists");
  }

  const user = {
    id: randomUUID(),
    name: input.name,
    email,
    role: input.role || "staff",
    password: input.password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeCollection(FILE_NAME, users);
  return sanitizeUser(user);
}

export async function findUserByCredentials(email, password) {
  const users = await readCollection(FILE_NAME);
  const normalizedEmail = String(email).trim().toLowerCase();
  return users.find((entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password) || null;
}
