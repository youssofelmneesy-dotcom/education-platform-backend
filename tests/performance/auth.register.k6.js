import { check } from "k6";

import { performanceOptions, registerUser, uniqueEmail } from "./shared.js";

const PASSWORD = "SecurePass123!";

export const options = performanceOptions();

export default function () {
  const email = uniqueEmail("register-load");
  const response = registerUser(email, PASSWORD);

  check(response, {
    "register status is 201": (res) => res.status === 201,
    "register returns JSON": (res) => res.headers["Content-Type"]?.includes("application/json"),
    "register body has success": (res) => res.json("success") === true,
    "register body has message": (res) => res.json("message") === "User registered successfully",
    "register body has user data": (res) => Boolean(res.json("data.id") && res.json("data.email") === email),
    "register response time under 500ms": (res) => res.timings.duration < 500,
    "register does not set cookies": (res) => !res.headers["Set-Cookie"],
  });
}
