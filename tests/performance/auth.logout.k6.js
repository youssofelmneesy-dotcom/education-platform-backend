import { check } from "k6";

import { loginUser, logoutUser, performanceOptions, registerUser, uniqueEmail } from "./shared.js";

const PASSWORD = "SecurePass123!";

export const options = performanceOptions();

export function setup() {
  const email = uniqueEmail("logout-load");
  const registerResponse = registerUser(email, PASSWORD);

  check(registerResponse, {
    "setup register succeeded": (res) => res.status === 201,
  });

  return { email, password: PASSWORD };
}

export default function (data) {
  const loginResponse = loginUser(data.email, data.password);

  check(loginResponse, {
    "login before logout succeeded": (res) => res.status === 200,
  });

  const refreshToken = loginResponse.json("data.refreshToken");
  const response = logoutUser(refreshToken);

  check(response, {
    "logout status is 204": (res) => res.status === 204,
    "logout response body is empty": (res) => res.body === "",
    "logout response time under 500ms": (res) => res.timings.duration < 500,
    "logout does not set cookies": (res) => !res.headers["Set-Cookie"],
  });
}
