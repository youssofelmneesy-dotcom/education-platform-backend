import request from "supertest";
import app from "../../../src/app.js";

/**
 * Authentication helpers for integration tests
 */

export async function getAuthToken(email: string, password = "SecurePass123!") {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  
  if (loginResponse.status !== 200) {
    throw new Error(`Failed to login for ${email}: ${JSON.stringify(loginResponse.body)}`);
  }

  return {
    accessToken: loginResponse.body.data.accessToken,
    user: loginResponse.body.data.user
  };
}

export async function registerAndLogin(firstName: string, lastName: string, email: string, password = "SecurePass123!") {
  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send({
      firstName,
      lastName,
      email,
      password,
      confirmPassword: password
    });

  if (registerResponse.status !== 201) {
    throw new Error(`Failed to register user ${email}: ${JSON.stringify(registerResponse.body)}`);
  }

  return getAuthToken(email, password);
}
