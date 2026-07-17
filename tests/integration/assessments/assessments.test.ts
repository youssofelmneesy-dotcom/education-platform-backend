import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";
import { findUserByEmail } from "../helpers/db.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorizedEmail = `assessments-${testRunId}@example.com`;
const forbiddenEmail = `assessments-forbidden-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
const assessmentPermissions = [
  "assessments:create",
  "assessments:list",
  "assessments:read",
  "assessments:update",
  "assessments:delete",
  "assessments:grade",
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

async function grantAssessmentPermissions(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error(`User not found for ${email}`);
  }

  const role = await prisma.role.create({
    data: { tenantId, name: `assessments-tester-${testRunId}`, description: "Assessments integration test role" },
  });

  await prisma.userRole.create({ data: { tenantId, userId: user.id, roleId: role.id } });

  await Promise.all(
    assessmentPermissions.map(async (permissionName) => {
      const permission = await prisma.permission.create({
        data: {
          tenantId,
          resource: "assessments",
          action: permissionName.split(":")[1] ?? permissionName,
          description: `${permissionName} permission`,
        },
      });

      await prisma.rolePermission.create({ data: { tenantId, roleId: role.id, permissionId: permission.id } });
    })
  );
}

async function createFixture() {
  const course = await prisma.course.create({
    data: { tenantId, title: `Assessment Course ${testRunId}`, slug: `assessment-course-${testRunId}`, status: "draft" },
  });
  const lesson = await prisma.lesson.create({
    data: { tenantId, courseId: course.id, title: `Assessment Lesson ${testRunId}`, slug: `assessment-lesson-${testRunId}`, sortOrder: 1 },
  });
  const questionBank = await prisma.questionBank.create({
    data: { tenantId, courseId: course.id, title: `Assessment Bank ${testRunId}` },
  });
  const question = await prisma.question.create({
    data: {
      tenantId,
      questionBankId: questionBank.id,
      type: "single_choice",
      prompt: `Assessment prompt ${testRunId}`,
      points: 1,
      sortOrder: 0,
    },
  });
  const correctChoice = await prisma.choice.create({
    data: { tenantId, questionId: question.id, content: "Correct", isCorrect: true, sortOrder: 0 },
  });
  await prisma.choice.create({
    data: { tenantId, questionId: question.id, content: "Incorrect", isCorrect: false, sortOrder: 1 },
  });

  return { course, lesson, questionBank, question, correctChoice };
}

async function createExam(token: string, courseId: string, lessonId: string, questionBankId: string, title: string, status = "draft") {
  return request(app)
    .post("/api/assessments/exams")
    .set("Authorization", `Bearer ${token}`)
    .send({
      courseId,
      lessonId,
      questionBankId,
      title,
      description: "Assessment integration exam",
      status,
      passingScore: 1,
      maxAttempts: 2,
    });
}

describe("Assessments API", () => {
  let accessToken: string;
  let forbiddenAccessToken: string;
  let courseId: string;
  let lessonId: string;
  let questionBankId: string;
  let questionId: string;
  let correctChoiceId: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser("Assessment", "Tester", authorizedEmail);
    await registerTestUser("Assessment", "Forbidden", forbiddenEmail);
    await grantAssessmentPermissions(authorizedEmail);
    const fixture = await createFixture();
    const authorized = await getAuthToken(authorizedEmail, password);
    const forbidden = await getAuthToken(forbiddenEmail, password);

    accessToken = authorized.accessToken;
    forbiddenAccessToken = forbidden.accessToken;
    courseId = fixture.course.id;
    lessonId = fixture.lesson.id;
    questionBankId = fixture.questionBank.id;
    questionId = fixture.question.id;
    correctChoiceId = fixture.correctChoice.id;
  });

  describe("exams", () => {
    it("creates, lists, reads, updates, deletes, restores, and reports statistics", async () => {
      const created = await createExam(accessToken, courseId, lessonId, questionBankId, `Assessment Exam ${testRunId}`);
      const list = await request(app).get("/api/assessments/exams").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
      const read = await request(app).get(`/api/assessments/exams/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const updated = await request(app)
        .patch(`/api/assessments/exams/${created.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Updated assessment exam", status: "published" });
      const deleted = await request(app).delete(`/api/assessments/exams/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const restored = await request(app).post(`/api/assessments/exams/${created.body.data.id}/restore`).set("Authorization", `Bearer ${accessToken}`);
      const statistics = await request(app).get("/api/assessments/statistics").set("Authorization", `Bearer ${accessToken}`);

      expect(created.status).toBe(201);
      expect(created.body.data).toMatchObject({ courseId, lessonId, questionBankId, title: `Assessment Exam ${testRunId}` });
      expect(list.status).toBe(200);
      expect(read.status).toBe(200);
      expect(updated.status).toBe(200);
      expect(updated.body.data).toMatchObject({ title: "Updated assessment exam", status: "published" });
      expect(deleted.status).toBe(204);
      expect(restored.status).toBe(200);
      expect(statistics.status).toBe(200);
      expect(statistics.body.data.totalExams).toBeGreaterThanOrEqual(1);
    });

    it("rejects validation failures, unauthorized requests, forbidden requests, and missing exams", async () => {
      const invalid = await request(app).post("/api/assessments/exams").set("Authorization", `Bearer ${accessToken}`).send({ courseId: "bad-id", title: "" });
      const unauthorized = await request(app).get("/api/assessments/exams");
      const forbidden = await request(app).post("/api/assessments/exams").set("Authorization", `Bearer ${forbiddenAccessToken}`).send({ courseId, title: "Forbidden exam" });
      const missing = await request(app).get("/api/assessments/exams/11111111-1111-4111-8111-111111111111").set("Authorization", `Bearer ${accessToken}`);

      expect(invalid.status).toBe(400);
      expect(unauthorized.status).toBe(401);
      expect(forbidden.status).toBe(403);
      expect(missing.status).toBe(404);
    });
  });

  describe("exam questions", () => {
    it("assigns, lists, reorders, and removes questions", async () => {
      const exam = await createExam(accessToken, courseId, lessonId, questionBankId, `Question Assignment Exam ${testRunId}`);
      const assigned = await request(app)
        .post(`/api/assessments/exams/${exam.body.data.id}/questions`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ questionId, points: 1, sortOrder: 0 });
      const list = await request(app).get(`/api/assessments/exams/${exam.body.data.id}/questions`).set("Authorization", `Bearer ${accessToken}`);
      const reordered = await request(app)
        .patch(`/api/assessments/exams/${exam.body.data.id}/questions/reorder`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ questions: [{ poolId: assigned.body.data.id, sortOrder: 2 }] });
      const removed = await request(app).delete(`/api/assessments/exams/${exam.body.data.id}/questions/${assigned.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);

      expect(assigned.status).toBe(201);
      expect(assigned.body.data).toMatchObject({ examId: exam.body.data.id, questionId, points: 1 });
      expect(list.status).toBe(200);
      expect(list.body.data).toHaveLength(1);
      expect(reordered.status).toBe(200);
      expect(reordered.body.data[0].sortOrder).toBe(2);
      expect(removed.status).toBe(204);
    });

    it("returns not found for missing questions and pools", async () => {
      const exam = await createExam(accessToken, courseId, lessonId, questionBankId, `Missing Question Exam ${testRunId}`);
      const missingQuestion = await request(app)
        .post(`/api/assessments/exams/${exam.body.data.id}/questions`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ questionId: "11111111-1111-4111-8111-111111111111" });
      const missingPool = await request(app)
        .delete(`/api/assessments/exams/${exam.body.data.id}/questions/11111111-1111-4111-8111-111111111111`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(missingQuestion.status).toBe(404);
      expect(missingPool.status).toBe(404);
    });
  });

  describe("attempts and grading", () => {
    it("starts, resumes, answers, clears, submits, reviews, and grades attempts", async () => {
      const exam = await createExam(accessToken, courseId, lessonId, questionBankId, `Attempt Exam ${testRunId}`, "published");
      await request(app).post(`/api/assessments/exams/${exam.body.data.id}/questions`).set("Authorization", `Bearer ${accessToken}`).send({ questionId, points: 1, sortOrder: 0 });

      const started = await request(app).post(`/api/assessments/exams/${exam.body.data.id}/attempts`).set("Authorization", `Bearer ${accessToken}`);
      const duplicate = await request(app).post(`/api/assessments/exams/${exam.body.data.id}/attempts`).set("Authorization", `Bearer ${accessToken}`);
      const resumed = await request(app).get(`/api/assessments/exams/${exam.body.data.id}/attempts/active`).set("Authorization", `Bearer ${accessToken}`);
      const saved = await request(app)
        .patch(`/api/assessments/attempts/${started.body.data.id}/answers`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ questionId, selectedChoiceIds: [correctChoiceId] });
      const cleared = await request(app).delete(`/api/assessments/attempts/${started.body.data.id}/answers/${saved.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const savedAgain = await request(app)
        .patch(`/api/assessments/attempts/${started.body.data.id}/answers`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ questionId, selectedChoiceIds: [correctChoiceId] });
      const submitted = await request(app).post(`/api/assessments/attempts/${started.body.data.id}/submit`).set("Authorization", `Bearer ${accessToken}`);
      const result = await request(app).get(`/api/assessments/attempts/${started.body.data.id}/result`).set("Authorization", `Bearer ${accessToken}`);
      const review = await request(app).get(`/api/assessments/attempts/${started.body.data.id}/review`).set("Authorization", `Bearer ${accessToken}`);
      const graded = await request(app).patch(`/api/assessments/answers/${savedAgain.body.data.id}/grade`).set("Authorization", `Bearer ${accessToken}`).send({ isCorrect: true, pointsAwarded: 1 });

      expect(started.status).toBe(201);
      expect(duplicate.status).toBe(409);
      expect(resumed.status).toBe(200);
      expect(saved.status).toBe(200);
      expect(cleared.status).toBe(204);
      expect(savedAgain.status).toBe(200);
      expect(submitted.status).toBe(200);
      expect(submitted.body.data.result).toMatchObject({ score: 1, maxScore: 1, passed: true });
      expect(result.status).toBe(200);
      expect(review.status).toBe(200);
      expect(graded.status).toBe(200);
      expect(graded.body.data).toMatchObject({ isCorrect: true, pointsAwarded: 1 });
    });

    it("rejects unavailable exams and missing active attempts", async () => {
      const exam = await createExam(accessToken, courseId, lessonId, questionBankId, `Unavailable Exam ${testRunId}`, "draft");
      const unavailable = await request(app).post(`/api/assessments/exams/${exam.body.data.id}/attempts`).set("Authorization", `Bearer ${accessToken}`);
      const missingActive = await request(app).get(`/api/assessments/exams/${exam.body.data.id}/attempts/active`).set("Authorization", `Bearer ${accessToken}`);

      expect(unavailable.status).toBe(403);
      expect(missingActive.status).toBe(404);
    });
  });
});
