import { createUser, listUsers } from "../services/userService.js";

export async function getUsers(_req, res) {
  const users = await listUsers();
  res.json(users);
}

export async function postUser(req, res) {
  const user = await createUser(req.body);
  res.status(201).json(user);
}
