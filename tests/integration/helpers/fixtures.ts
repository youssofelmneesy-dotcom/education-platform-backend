import { faker } from "@faker-js/faker";

/**
 * Test data fixtures for integration tests
 */

export function createUserFixture(overrides?: Record<string, unknown>) {
  return {
    firstName: "John",
    lastName: "Doe",
    email: faker.internet.email().toLowerCase(),
    password: "SecurePass123!",
    ...overrides,
  };
}

export function createInvalidEmailFixture(overrides?: Record<string, unknown>) {
  return {
    firstName: "Jane",
    lastName: "Smith",
    email: "invalid-email",
    password: "SecurePass123!",
    ...overrides,
  };
}

export function createWeakPasswordFixture(overrides?: Record<string, unknown>) {
  return {
    firstName: "Bob",
    lastName: "Wilson",
    email: faker.internet.email().toLowerCase(),
    password: "weak",
    ...overrides,
  };
}

export function createLoginFixture(email: string, password: string) {
  return {
    email,
    password,
  };
}

export function createRefreshTokenFixture(token: string) {
  return {
    refreshToken: token,
  };
}

export function createLogoutFixture(token: string) {
  return {
    refreshToken: token,
  };
}
