import { check } from "k6";

import { loginUser, performanceOptions, registerUser, uniqueEmail } from "./shared.js";

const PASSWORD = "SecurePass123!";

export const options = performanceOptions();

export function setup() {
  const email = uniqueEmail("login-load");
  const registerResponse = registerUser(email, PASSWORD);

  check(registerResponse, {
    "setup register succeeded": (res) => res.status === 201,
  });

  return { email, password: PASSWORD };
}

export default function (data) {
  const response = loginUser(data.email, data.password);

  check(response, {
    "login status is 200": (res) => res.status === 200,
    "login returns JSON": (res) => res.headers["Content-Type"]?.includes("application/json"),
    "login body has success": (res) => res.json("success") === true,
    "login body has tokens": (res) => Boolean(res.json("data.accessToken") && res.json("data.refreshToken")),
    "login returns JWTs": (res) => res.json("data.accessToken").split(".").length === 3 && res.json("data.refreshToken").split(".").length === 3,
    "login response time under 500ms": (res) => res.timings.duration < 500,
    "login does not set cookies": (res) => !res.headers["Set-Cookie"],
  });
}
