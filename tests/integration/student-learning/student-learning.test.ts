import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";
import { cleanupTestUser, findUserByEmail } from "../helpers/db.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const studentEmail = `student-learning-${testRunId}@example.com`;
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
    firstName: "Student",
    lastName: "Learning",
    email: studentEmail,
    password,
    confirmPassword: password,
  });

  expect(response.status).toBe(201);
}

async function createLearningFixture() {
  const course = await prisma.course.create({
    data: {
      tenantId,
      title: `Learning Course ${testRunId}`,
      slug: `learning-course-${testRunId}`,
      status: "draft",
    },
  });

  const lesson = await prisma.lesson.create({
    data: {
      tenantId,
      courseId: course.id,
      title: `Learning Lesson ${testRunId}`,
      slug: `learning-lesson-${testRunId}`,
      sortOrder: 1,
    },
  });

  const video = await prisma.video.create({
    data: {
      tenantId,
      lessonId: lesson.id,
      title: `Learning Video ${testRunId}`,
      sourceUrl: `https://example.com/learning-${testRunId}.mp4`,
      durationSeconds: 600,
    },
  });

  return { course, lesson, video };
}

describe("Student Learning API", () => {
  let accessToken: string;
  let userId: string;
  let courseId: string;
  let lessonId: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser();
    const auth = await getAuthToken(studentEmail, password);
    const user = await findUserByEmail(studentEmail);
    const fixture = await createLearningFixture();

    if (!user) {
      throw new Error("Student learning test user not found");
    }

    accessToken = auth.accessToken;
    userId = user.id;
    courseId = fixture.course.id;
    lessonId = fixture.lesson.id;
  });

  afterAll(async () => {
    await cleanupTestUser(studentEmail);
  });

  describe("lesson progress", () => {
    it("starts, updates, reads, completes, and marks a lesson incomplete", async () => {
      // Act
      const started = await request(app).post(`/api/learning/lessons/${lessonId}/start`).set("Authorization", `Bearer ${accessToken}`);
      const updated = await request(app)
        .patch(`/api/learning/lessons/${lessonId}/progress`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ watchedSeconds: 300, progressPercent: 50 });
      const progress = await request(app).get(`/api/learning/lessons/${lessonId}/progress`).set("Authorization", `Bearer ${accessToken}`);
      const completed = await request(app).post(`/api/learning/lessons/${lessonId}/complete`).set("Authorization", `Bearer ${accessToken}`);
      const incomplete = await request(app).post(`/api/learning/lessons/${lessonId}/incomplete`).set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(started.status).toBe(200);
      expect(updated.status).toBe(200);
      expect(updated.body.data).toMatchObject({ lessonId, courseId, watchedSeconds: 300, progressPercent: 50 });
      expect(progress.status).toBe(200);
      expect(completed.status).toBe(200);
      expect(completed.body.data.progressPercent).toBe(100);
      expect(incomplete.status).toBe(200);
      expect(incomplete.body.data.progressPercent).toBe(0);
    });

    it("rejects invalid progress payloads and missing lesson progress", async () => {
      // Act
      const invalid = await request(app)
        .patch(`/api/learning/lessons/${lessonId}/progress`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ watchedSeconds: -1, progressPercent: 101 });
      const missing = await request(app)
        .get("/api/learning/lessons/00000000-0000-0000-0000-000000000000/progress")
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(invalid.status).toBe(400);
      expect(missing.status).toBe(422);
    });
  });

  describe("course progress and watching lists", () => {
    it("returns course progress, recent watches, continue watching, last watched, and dashboard", async () => {
      // Arrange
      await request(app)
        .patch(`/api/learning/lessons/${lessonId}/progress`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ watchedSeconds: 120, progressPercent: 20 });

      // Act
      const courseProgress = await request(app).get(`/api/learning/courses/${courseId}/progress`).set("Authorization", `Bearer ${accessToken}`);
      const recent = await request(app).get("/api/learning/watch-history/recent").query({ limit: 5 }).set("Authorization", `Bearer ${accessToken}`);
      const current = await request(app).get("/api/learning/continue-watching").query({ limit: 5 }).set("Authorization", `Bearer ${accessToken}`);
      const last = await request(app).get(`/api/learning/courses/${courseId}/last-watched`).set("Authorization", `Bearer ${accessToken}`);
      const dashboard = await request(app).get("/api/learning/dashboard").set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(courseProgress.status).toBe(200);
      expect(courseProgress.body.data).toMatchObject({ courseId, totalLessons: 1 });
      expect(recent.status).toBe(200);
      expect(recent.body.data).toEqual(expect.any(Array));
      expect(current.status).toBe(200);
      expect(current.body.data).toEqual(expect.any(Array));
      expect(last.status).toBe(200);
      expect(last.body.data.lessonId).toBe(lessonId);
      expect(dashboard.status).toBe(200);
      expect(dashboard.body.data.overallStatistics).toEqual(expect.any(Object));
    });
  });

  describe("notes", () => {
    it("creates, lists, updates, and deletes notes", async () => {
      // Act
      const created = await request(app)
        .post(`/api/learning/lessons/${lessonId}/notes`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Remember this lesson" });
      const lessonNotes = await request(app).get(`/api/learning/lessons/${lessonId}/notes`).set("Authorization", `Bearer ${accessToken}`);
      const myNotes = await request(app).get("/api/learning/notes").set("Authorization", `Bearer ${accessToken}`);
      const updated = await request(app)
        .patch(`/api/learning/notes/${created.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "Updated note" });
      const deleted = await request(app).delete(`/api/learning/notes/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const deleteAgain = await request(app).delete(`/api/learning/notes/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(created.status).toBe(201);
      expect(created.body.data.content).toBe("Remember this lesson");
      expect(lessonNotes.status).toBe(200);
      expect(myNotes.status).toBe(200);
      expect(updated.status).toBe(200);
      expect(updated.body.data.content).toBe("Updated note");
      expect(deleted.status).toBe(204);
      expect(deleteAgain.status).toBe(404);
    });

    it("rejects invalid note content", async () => {
      // Act
      const response = await request(app)
        .post(`/api/learning/lessons/${lessonId}/notes`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "" });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe("bookmarks", () => {
    it("bookmarks and removes courses and lessons", async () => {
      // Act
      const courseBookmark = await request(app).post(`/api/learning/courses/${courseId}/bookmark`).set("Authorization", `Bearer ${accessToken}`);
      const lessonBookmark = await request(app).post(`/api/learning/lessons/${lessonId}/bookmark`).set("Authorization", `Bearer ${accessToken}`);
      const bookmarks = await request(app).get("/api/learning/bookmarks").set("Authorization", `Bearer ${accessToken}`);
      const removeCourse = await request(app).delete(`/api/learning/courses/${courseId}/bookmark`).set("Authorization", `Bearer ${accessToken}`);
      const removeLesson = await request(app).delete(`/api/learning/lessons/${lessonId}/bookmark`).set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(courseBookmark.status).toBe(201);
      expect(courseBookmark.body.data.type).toBe("course");
      expect(lessonBookmark.status).toBe(201);
      expect(lessonBookmark.body.data.type).toBe("lesson");
      expect(bookmarks.status).toBe(200);
      expect(bookmarks.body.data.total).toBeGreaterThanOrEqual(2);
      expect(removeCourse.status).toBe(204);
      expect(removeLesson.status).toBe(204);
    });

    it("returns not found when bookmarking a missing lesson", async () => {
      // Act
      const response = await request(app)
        .post("/api/learning/lessons/00000000-0000-0000-0000-000000000000/bookmark")
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe("authorization", () => {
    it("rejects unauthenticated requests", async () => {
      // Act
      const response = await request(app).get("/api/learning/dashboard");

      // Assert
      expect(response.status).toBe(401);
    });

    it("uses the authenticated user for learning records", async () => {
      // Act
      const progress = await prisma.watchProgress.findFirst({
        where: { tenantId, userId },
      });

      // Assert
      expect(progress).not.toBeNull();
    });
  });
});
