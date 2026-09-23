import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const email = `lesson-attachments-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";

async function ensureDefaultTenant() {
  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: { id: tenantId, name: "Test Tenant", slug: "test-tenant" },
  });
}

async function registerTestUser() {
  const response = await request(app).post("/api/auth/register").send({
    firstName: "Lesson",
    lastName: "Attachment",
    email,
    password,
    confirmPassword: password,
  });

  expect(response.status).toBe(201);
}

async function createFixture() {
  const course = await prisma.course.create({
    data: { tenantId, title: `Attachment Course ${testRunId}`, slug: `attachment-course-${testRunId}`, status: "draft" },
  });
  const lesson = await prisma.lesson.create({
    data: { tenantId, courseId: course.id, title: `Attachment Lesson ${testRunId}`, slug: `attachment-lesson-${testRunId}`, sortOrder: 1 },
  });

  return { course, lesson };
}

describe("Lesson Attachments API", () => {
  let accessToken: string;
  let lessonId: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser();
    const fixture = await createFixture();
    accessToken = (await getAuthToken(email, password)).accessToken;
    lessonId = fixture.lesson.id;
  });

  it("creates, lists, reads, updates, and deletes lesson attachments", async () => {
    const created = await request(app)
      .post("/api/lesson-attachments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ lessonId, title: `Worksheet ${testRunId}`, fileUrl: "https://example.com/worksheet.pdf", fileType: "pdf", fileSize: 100, sortOrder: 0 });
    const list = await request(app).get("/api/lesson-attachments").query({ lessonId, page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
    const read = await request(app).get(`/api/lesson-attachments/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
    const updated = await request(app).patch(`/api/lesson-attachments/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`).send({ title: "Updated worksheet", sortOrder: 1 });
    const deleted = await request(app).delete(`/api/lesson-attachments/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ lessonId, title: `Worksheet ${testRunId}`, fileType: "pdf", fileSize: 100 });
    expect(list.status).toBe(200);
    expect(list.body.data.attachments).toHaveLength(1);
    expect(read.status).toBe(200);
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ title: "Updated worksheet", sortOrder: 1 });
    expect(deleted.status).toBe(204);
  });

  it("rejects validation failures, unauthorized requests, missing lessonId, missing lessons, and missing attachments", async () => {
    const invalid = await request(app).post("/api/lesson-attachments").set("Authorization", `Bearer ${accessToken}`).send({ lessonId, title: "", fileUrl: "not-url" });
    const unauthorized = await request(app).get("/api/lesson-attachments").query({ lessonId });
    const missingLessonId = await request(app).get("/api/lesson-attachments").set("Authorization", `Bearer ${accessToken}`);
    const missingLesson = await request(app)
      .post("/api/lesson-attachments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ lessonId: "11111111-1111-4111-8111-111111111111", title: "Missing lesson", fileUrl: "https://example.com/missing.pdf" });
    const missingAttachment = await request(app).get("/api/lesson-attachments/11111111-1111-4111-8111-111111111111").set("Authorization", `Bearer ${accessToken}`);

    expect(invalid.status).toBe(400);
    expect(unauthorized.status).toBe(401);
    expect(missingLessonId.status).toBe(400);
    expect(missingLesson.status).toBe(404);
    expect(missingAttachment.status).toBe(404);
  });
});
