import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";
import { findUserByEmail } from "../helpers/db.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorizedEmail = `learning-ops-${testRunId}@example.com`;
const forbiddenEmail = `learning-ops-forbidden-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
const permissions = [
  "learning-operations:read",
  "assignments:create",
  "assignments:list",
  "assignments:read",
  "assignments:update",
  "assignments:delete",
  "submissions:list",
  "submissions:grade",
  "certificates:create",
  "certificates:list",
  "certificates:read",
  "certificates:update",
  "certificates:delete",
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

async function grantPermissions(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error(`User not found for ${email}`);

  const role = await prisma.role.create({
    data: { tenantId, name: `learning-ops-tester-${testRunId}`, description: "Learning operations integration test role" },
  });

  await prisma.userRole.create({ data: { tenantId, userId: user.id, roleId: role.id } });

  await Promise.all(
    permissions.map(async (permissionName) => {
      const [resource, action] = permissionName.split(":");
      const permission = await prisma.permission.create({
        data: { tenantId, resource, action, description: `${permissionName} permission` },
      });
      await prisma.rolePermission.create({ data: { tenantId, roleId: role.id, permissionId: permission.id } });
    })
  );
}

async function createFixture() {
  const course = await prisma.course.create({
    data: { tenantId, title: `LO Course ${testRunId}`, slug: `lo-course-${testRunId}`, status: "draft" },
  });
  const lesson = await prisma.lesson.create({
    data: { tenantId, courseId: course.id, title: `LO Lesson ${testRunId}`, slug: `lo-lesson-${testRunId}`, sortOrder: 1 },
  });
  return { course, lesson };
}

async function createAssignment(token: string, courseId: string, lessonId: string, title = `Assignment ${testRunId}`) {
  return request(app)
    .post("/api/learning-operations/assignments")
    .set("Authorization", `Bearer ${token}`)
    .send({ courseId, lessonId, title, description: "Assignment description", instructions: "Submit work", status: "draft", maxScore: 100 });
}

describe("Learning Operations API", () => {
  let accessToken: string;
  let forbiddenAccessToken: string;
  let userId: string;
  let courseId: string;
  let lessonId: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser("Learning", "Operator", authorizedEmail);
    await registerTestUser("Learning", "Forbidden", forbiddenEmail);
    await grantPermissions(authorizedEmail);
    const user = await findUserByEmail(authorizedEmail);
    const fixture = await createFixture();

    if (!user) throw new Error("Authorized user not found");

    userId = user.id;
    courseId = fixture.course.id;
    lessonId = fixture.lesson.id;
    accessToken = (await getAuthToken(authorizedEmail, password)).accessToken;
    forbiddenAccessToken = (await getAuthToken(forbiddenEmail, password)).accessToken;
  });

  it("creates, lists, reads, updates, deletes, restores assignments, and reports statistics", async () => {
    const created = await createAssignment(accessToken, courseId, lessonId);
    const list = await request(app).get("/api/learning-operations/assignments").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
    const read = await request(app).get(`/api/learning-operations/assignments/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
    const updated = await request(app)
      .patch(`/api/learning-operations/assignments/${created.body.data.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Updated assignment", status: "published" });
    const deleted = await request(app).delete(`/api/learning-operations/assignments/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
    const restored = await request(app).post(`/api/learning-operations/assignments/${created.body.data.id}/restore`).set("Authorization", `Bearer ${accessToken}`);
    const statistics = await request(app).get("/api/learning-operations/statistics").set("Authorization", `Bearer ${accessToken}`);

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ courseId, lessonId, title: `Assignment ${testRunId}` });
    expect(list.status).toBe(200);
    expect(read.status).toBe(200);
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ title: "Updated assignment", status: "published" });
    expect(deleted.status).toBe(204);
    expect(restored.status).toBe(200);
    expect(statistics.status).toBe(200);
  });

  it("rejects validation failures, unauthorized requests, forbidden requests, and missing assignments", async () => {
    const invalid = await request(app).post("/api/learning-operations/assignments").set("Authorization", `Bearer ${accessToken}`).send({ courseId: "bad-id", title: "" });
    const unauthorized = await request(app).get("/api/learning-operations/assignments");
    const forbidden = await createAssignment(forbiddenAccessToken, courseId, lessonId, `Forbidden ${testRunId}`);
    const missing = await request(app).get("/api/learning-operations/assignments/11111111-1111-4111-8111-111111111111").set("Authorization", `Bearer ${accessToken}`);

    expect(invalid.status).toBe(400);
    expect(unauthorized.status).toBe(401);
    expect(forbidden.status).toBe(403);
    expect(missing.status).toBe(404);
  });

  it("creates, updates, submits, lists, and grades submissions", async () => {
    const assignment = await createAssignment(accessToken, courseId, lessonId, `Submission Assignment ${testRunId}`);
    const created = await request(app)
      .post(`/api/learning-operations/assignments/${assignment.body.data.id}/submissions`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "Initial answer", files: [{ fileName: "answer.pdf", fileUrl: "https://example.com/answer.pdf", fileType: "pdf", fileSize: 100 }] });
    const updated = await request(app).patch(`/api/learning-operations/submissions/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`).send({ content: "Updated answer" });
    const submitted = await request(app).post(`/api/learning-operations/submissions/${created.body.data.id}/submit`).set("Authorization", `Bearer ${accessToken}`);
    const mine = await request(app).get("/api/learning-operations/submissions/me").set("Authorization", `Bearer ${accessToken}`);
    const list = await request(app).get(`/api/learning-operations/assignments/${assignment.body.data.id}/submissions`).set("Authorization", `Bearer ${accessToken}`);
    const graded = await request(app).post(`/api/learning-operations/submissions/${created.body.data.id}/grade`).set("Authorization", `Bearer ${accessToken}`).send({ score: 90, maxScore: 100, feedback: "Good" });

    expect(created.status).toBe(201);
    expect(created.body.data.files).toHaveLength(1);
    expect(updated.status).toBe(200);
    expect(updated.body.data.content).toBe("Updated answer");
    expect(submitted.status).toBe(200);
    expect(submitted.body.data.status).toBe("submitted");
    expect(mine.status).toBe(200);
    expect(list.status).toBe(200);
    expect(graded.status).toBe(200);
    expect(graded.body.data).toMatchObject({ score: 90, maxScore: 100 });
  });

  it("creates, lists, updates, and deletes rubrics", async () => {
    const assignment = await createAssignment(accessToken, courseId, lessonId, `Rubric Assignment ${testRunId}`);
    const created = await request(app)
      .post(`/api/learning-operations/assignments/${assignment.body.data.id}/rubrics`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Quality", maxScore: 10, sortOrder: 0 });
    const list = await request(app).get(`/api/learning-operations/assignments/${assignment.body.data.id}/rubrics`).set("Authorization", `Bearer ${accessToken}`);
    const updated = await request(app)
      .patch(`/api/learning-operations/assignments/${assignment.body.data.id}/rubrics/${created.body.data.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Updated quality" });
    const deleted = await request(app).delete(`/api/learning-operations/assignments/${assignment.body.data.id}/rubrics/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);

    expect(created.status).toBe(201);
    expect(list.status).toBe(200);
    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe("Updated quality");
    expect(deleted.status).toBe(204);
  });

  it("manages certificate templates and certificates", async () => {
    const template = await request(app).post("/api/learning-operations/certificate-templates").set("Authorization", `Bearer ${accessToken}`).send({ name: `Template ${testRunId}`, content: "Certificate content", isDefault: true });
    const templates = await request(app).get("/api/learning-operations/certificate-templates").set("Authorization", `Bearer ${accessToken}`);
    const updatedTemplate = await request(app).patch(`/api/learning-operations/certificate-templates/${template.body.data.id}`).set("Authorization", `Bearer ${accessToken}`).send({ name: `Updated Template ${testRunId}` });
    const certificate = await request(app).post("/api/learning-operations/certificates").set("Authorization", `Bearer ${accessToken}`).send({ courseId, userId, templateId: template.body.data.id });
    const certificates = await request(app).get("/api/learning-operations/certificates").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
    const read = await request(app).get(`/api/learning-operations/certificates/${certificate.body.data.certificateNumber}`).set("Authorization", `Bearer ${accessToken}`);
    const verified = await request(app).get(`/api/learning-operations/certificate-verifications/${certificate.body.data.verificationCode}`).set("Authorization", `Bearer ${accessToken}`);
    const revoked = await request(app).post(`/api/learning-operations/certificates/${certificate.body.data.id}/revoke`).set("Authorization", `Bearer ${accessToken}`);
    const deletedTemplate = await request(app).delete(`/api/learning-operations/certificate-templates/${template.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);

    expect(template.status).toBe(201);
    expect(templates.status).toBe(200);
    expect(updatedTemplate.status).toBe(200);
    expect(certificate.status).toBe(201);
    expect(certificates.status).toBe(200);
    expect(read.status).toBe(200);
    expect(verified.status).toBe(200);
    expect(revoked.status).toBe(200);
    expect(revoked.body.data.revokedAt).toBeTruthy();
    expect(deletedTemplate.status).toBe(204);
  });
});
