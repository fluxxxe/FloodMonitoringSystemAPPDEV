import { createHash } from "node:crypto";
import { findUserByCredentials } from "./userService.js";
import { createHttpError } from "../utils/httpError.js";

function createTokenPayload(user) {
  const signature = createHash("sha256")
    .update(`${user.id}:${user.email}:${Date.now()}`)
    .digest("hex");

  return {
    token: signature,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function login(email, password) {
  const user = await findUserByCredentials(email, password);
  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  return createTokenPayload(user);
}
