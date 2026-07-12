/* global __ENV, __VU, __ITER */

import http from "k6/http";

export const baseUrl = __ENV.BASE_URL ?? "http://127.0.0.1:4001";
export const jsonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export function jsonBody(payload) {
  return JSON.stringify(payload);
}

export function uniqueEmail(prefix) {
  return `${prefix}.${__VU}.${__ITER}.${Date.now()}@example.com`;
}

export function performanceOptions() {
  return {
    thresholds: {
      http_req_duration: ["p(95)<500"],
      http_req_failed: ["rate<0.01"],
    },
    scenarios: {
      smoke: {
        executor: "constant-vus",
        vus: 1,
        duration: "5s",
        exec: "default",
      },
      load: {
        executor: "constant-vus",
        vus: 5,
        duration: "10s",
        exec: "default",
        startTime: "5s",
      },
      stress: {
        executor: "ramping-vus",
        startVUs: 5,
        stages: [
          { duration: "5s", target: 15 },
          { duration: "5s", target: 15 },
        ],
        exec: "default",
        startTime: "15s",
      },
      spike: {
        executor: "ramping-vus",
        startVUs: 5,
        stages: [
          { duration: "2s", target: 35 },
          { duration: "3s", target: 5 },
        ],
        exec: "default",
        startTime: "25s",
      },
    },
    userAgent: "Education Platform Performance Tests",
    noConnectionReuse: false,
  };
}

export function authPayload(email, password) {
  return jsonBody({
    firstName: "Performance",
    lastName: "User",
    email,
    password,
    confirmPassword: password,
  });
}

export function loginPayload(email, password) {
  return jsonBody({
    email,
    password,
  });
}

export function refreshPayload(refreshToken) {
  return jsonBody({
    refreshToken,
  });
}

export function logoutPayload(refreshToken) {
  return jsonBody({
    refreshToken,
  });
}

export function registerUser(email, password) {
  return http.post(`${baseUrl}/api/auth/register`, authPayload(email, password), {
    headers: jsonHeaders,
  });
}

export function loginUser(email, password) {
  return http.post(`${baseUrl}/api/auth/login`, loginPayload(email, password), {
    headers: jsonHeaders,
  });
}

export function refreshUser(refreshToken) {
  return http.post(`${baseUrl}/api/auth/refresh`, refreshPayload(refreshToken), {
    headers: jsonHeaders,
  });
}

export function logoutUser(refreshToken) {
  return http.post(`${baseUrl}/api/auth/logout`, logoutPayload(refreshToken), {
    headers: jsonHeaders,
  });
}
