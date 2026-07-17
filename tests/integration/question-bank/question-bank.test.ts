import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";
import { cleanupTestUser, findUserByEmail } from "../helpers/db.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorizedEmail = `question-bank-${testRunId}@example.com`;
const forbiddenEmail = `question-bank-forbidden-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
const questionBankPermissions = [
  "question-bank:create",
  "question-bank:list",
  "question-bank:read",
  "question-bank:update",
  "question-bank:delete",
];

async function ensureDefaultTenant() {
  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: { id: tenantId, name: "Test Tenant", slug: "test-tenant" },
  });
}

async function registerTestUser(firstName: string, lastName: string, email: string) {
  const response = await request(app).post("/api/auth/register").send({
    firstName,
    lastName,
    email,
    password,
    confirmPassword: password,
  });

  expect(response.status).toBe(201);
}

async function grantQuestionBankPermissions(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error(`User not found for ${email}`);
  }

  const role = await prisma.role.create({
    data: { tenantId, name: `question-bank-tester-${testRunId}`, description: "Question bank integration test role" },
  });

  await prisma.userRole.create({ data: { tenantId, userId: user.id, roleId: role.id } });

  await Promise.all(
    questionBankPermissions.map(async (permissionName) => {
      const permission = await prisma.permission.create({
        data: {
          tenantId,
          resource: "question-bank",
          action: permissionName.split(":")[1] ?? permissionName,
          description: `${permissionName} permission`,
        },
      });

      await prisma.rolePermission.create({ data: { tenantId, roleId: role.id, permissionId: permission.id } });
    })
  );
}

async function createQuestionBankFixture() {
  const course = await prisma.course.create({
    data: { tenantId, title: `QB Course ${testRunId}`, slug: `qb-course-${testRunId}`, status: "draft" },
  });

  const lesson = await prisma.lesson.create({
    data: { tenantId, courseId: course.id, title: `QB Lesson ${testRunId}`, slug: `qb-lesson-${testRunId}`, sortOrder: 1 },
  });

  const questionBank = await prisma.questionBank.create({
    data: { tenantId, courseId: course.id, title: `QB ${testRunId}` },
  });

  const exam = await prisma.exam.create({
    data: { tenantId, courseId: course.id, lessonId: lesson.id, title: `QB Exam ${testRunId}`, status: "draft" },
  });

  return { course, lesson, questionBank, exam };
}

async function createQuestion(token: string, questionBankId: string, prompt: string) {
  return request(app)
    .post("/api/question-bank/questions")
    .set("Authorization", `Bearer ${token}`)
    .send({
      questionBankId,
      type: "single_choice",
      prompt,
      explanation: "Question explanation",
      points: 1,
      sortOrder: 0,
      choices: [{ content: "Choice A", isCorrect: true, sortOrder: 0 }],
    });
}

describe("Question Bank API", () => {
  let accessToken: string;
  let forbiddenAccessToken: string;
  let questionBankId: string;
  let examId: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser("Question", "Tester", authorizedEmail);
    await registerTestUser("Question", "Forbidden", forbiddenEmail);
    await grantQuestionBankPermissions(authorizedEmail);
    const fixture = await createQuestionBankFixture();
    const authorized = await getAuthToken(authorizedEmail, password);
    const forbidden = await getAuthToken(forbiddenEmail, password);

    accessToken = authorized.accessToken;
    forbiddenAccessToken = forbidden.accessToken;
    questionBankId = fixture.questionBank.id;
    examId = fixture.exam.id;
  });

  afterAll(async () => {
    await prisma.question.updateMany({
      where: { tenantId, questionBankId },
      data: { createdById: null },
    });
    await cleanupTestUser(authorizedEmail);
    await cleanupTestUser(forbiddenEmail);
  });

  describe("questions", () => {
    it("creates, lists, reads, updates, deletes, and restores a question", async () => {
      // Act
      const created = await createQuestion(accessToken, questionBankId, `Prompt ${testRunId}`);
      const list = await request(app).get("/api/question-bank/questions").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
      const read = await request(app).get(`/api/question-bank/questions/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const updated = await request(app)
        .patch(`/api/question-bank/questions/${created.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ prompt: "Updated prompt", points: 2 });
      const deleted = await request(app).delete(`/api/question-bank/questions/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const restored = await request(app).post(`/api/question-bank/questions/${created.body.data.id}/restore`).set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(created.status).toBe(201);
      expect(created.body.data).toMatchObject({ questionBankId, prompt: `Prompt ${testRunId}`, type: "single_choice" });
      expect(list.status).toBe(200);
      expect(read.status).toBe(200);
      expect(updated.status).toBe(200);
      expect(updated.body.data.prompt).toBe("Updated prompt");
      expect(deleted.status).toBe(204);
      expect(restored.status).toBe(200);
    });

    it("rejects validation failures, unauthorized requests, forbidden requests, and missing questions", async () => {
      // Act
      const invalid = await request(app)
        .post("/api/question-bank/questions")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ questionBankId: "bad-id", type: "", prompt: "" });
      const unauthorized = await request(app).get("/api/question-bank/questions");
      const forbidden = await request(app).get("/api/question-bank/questions").set("Authorization", `Bearer ${forbiddenAccessToken}`);
      const missing = await request(app)
        .get("/api/question-bank/questions/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(invalid.status).toBe(400);
      expect(unauthorized.status).toBe(401);
      expect(forbidden.status).toBe(403);
      expect(missing.status).toBe(404);
    });
  });

  describe("choices", () => {
    it("creates, reorders, marks correct, updates, and deletes choices", async () => {
      // Arrange
      const question = await createQuestion(accessToken, questionBankId, `Choice prompt ${testRunId}`);

      // Act
      const created = await request(app)
        .post(`/api/question-bank/questions/${question.body.data.id}/choices`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Choice B", isCorrect: false, sortOrder: 1 });
      const reordered = await request(app)
        .patch(`/api/question-bank/questions/${question.body.data.id}/choices/reorder`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ choices: [{ id: created.body.data.id, sortOrder: 2 }] });
      const correct = await request(app)
        .patch(`/api/question-bank/questions/${question.body.data.id}/choices/correct`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ choiceId: created.body.data.id });
      const updated = await request(app)
        .patch(`/api/question-bank/questions/${question.body.data.id}/choices/${created.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Updated Choice B" });
      const deleted = await request(app)
        .delete(`/api/question-bank/questions/${question.body.data.id}/choices/${created.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(created.status).toBe(201);
      expect(reordered.status).toBe(200);
      expect(correct.status).toBe(200);
      expect(updated.status).toBe(200);
      expect(updated.body.data.content).toBe("Updated Choice B");
      expect(deleted.status).toBe(204);
    });
  });

  describe("pools and statistics", () => {
    it("attaches, lists, removes pools, and returns statistics", async () => {
      // Arrange
      const question = await createQuestion(accessToken, questionBankId, `Pool prompt ${testRunId}`);

      // Act
      const attached = await request(app)
        .post(`/api/question-bank/questions/${question.body.data.id}/pools`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ examId, points: 1, sortOrder: 0 });
      const pools = await request(app).get(`/api/question-bank/questions/${question.body.data.id}/pools`).set("Authorization", `Bearer ${accessToken}`);
      const statistics = await request(app).get("/api/question-bank/questions/statistics").set("Authorization", `Bearer ${accessToken}`);
      const removed = await request(app)
        .delete(`/api/question-bank/questions/${question.body.data.id}/pools/${attached.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(attached.status).toBe(201);
      expect(pools.status).toBe(200);
      expect(statistics.status).toBe(200);
      expect(removed.status).toBe(204);
    });

    it("returns not found for missing pools", async () => {
      // Arrange
      const question = await createQuestion(accessToken, questionBankId, `Missing pool prompt ${testRunId}`);

      // Act
      const response = await request(app)
        .delete(`/api/question-bank/questions/${question.body.data.id}/pools/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
    });
  });
});
