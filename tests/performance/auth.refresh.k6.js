import { check } from "k6";

import { loginUser, performanceOptions, refreshUser, registerUser, uniqueEmail } from "./shared.js";

const PASSWORD = "SecurePass123!";

export const options = performanceOptions();

export function setup() {
  const email = uniqueEmail("refresh-load");
  const registerResponse = registerUser(email, PASSWORD);

  check(registerResponse, {
    "setup register succeeded": (res) => res.status === 201,
  });

  return { email, password: PASSWORD };
}

export default function (data) {
  const loginResponse = loginUser(data.email, data.password);

  check(loginResponse, {
    "login before refresh succeeded": (res) => res.status === 200,
  });

  const refreshToken = loginResponse.json("data.refreshToken");
  const response = refreshUser(refreshToken);

  check(response, {
    "refresh status is 200": (res) => res.status === 200,
    "refresh returns JSON": (res) => res.headers["Content-Type"]?.includes("application/json"),
    "refresh body has success": (res) => res.json("success") === true,
    "refresh body has tokens": (res) => Boolean(res.json("data.accessToken") && res.json("data.refreshToken")),
    "refresh returns JWTs": (res) => res.json("data.accessToken").split(".").length === 3 && res.json("data.refreshToken").split(".").length === 3,
    "refresh response time under 500ms": (res) => res.timings.duration < 500,
    "refresh does not set cookies": (res) => !res.headers["Set-Cookie"],
  });
}
