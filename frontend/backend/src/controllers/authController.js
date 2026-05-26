import { login } from "../services/authService.js";

export async function postLogin(req, res) {
  const result = await login(req.body.email, req.body.password);
  res.json(result);
}
