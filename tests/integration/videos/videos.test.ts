import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";
import { cleanupTestUser, findUserByEmail } from "../helpers/db.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorizedEmail = `videos-${testRunId}@example.com`;
const forbiddenEmail = `videos-forbidden-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
const videoPermissions = ["videos:create", "videos:list", "videos:read", "videos:update", "videos:delete"];

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

async function grantVideoPermissions(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error(`User not found for ${email}`);
  }

  const role = await prisma.role.create({
    data: { tenantId, name: `video-tester-${testRunId}`, description: "Video integration test role" },
  });

  await prisma.userRole.create({ data: { tenantId, userId: user.id, roleId: role.id } });

  await Promise.all(
    videoPermissions.map(async (permissionName) => {
      const permission = await prisma.permission.create({
        data: {
          tenantId,
          resource: "videos",
          action: permissionName.split(":")[1] ?? permissionName,
          description: `${permissionName} permission`,
        },
      });

      await prisma.rolePermission.create({ data: { tenantId, roleId: role.id, permissionId: permission.id } });
    })
  );
}

async function createParentLesson(slug: string) {
  const course = await prisma.course.create({
    data: { tenantId, title: `Course ${slug}`, slug: `course-${slug}`, status: "draft" },
  });

  return prisma.lesson.create({
    data: {
      tenantId,
      courseId: course.id,
      title: `Lesson ${slug}`,
      slug: `lesson-${slug}`,
      sortOrder: 1,
    },
  });
}

async function createVideo(token: string, lessonId: string, title: string) {
  return request(app)
    .post("/api/videos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      lessonId,
      title,
      sourceUrl: `https://example.com/${title}.mp4`,
      thumbnailUrl: `https://example.com/${title}.png`,
      durationSeconds: 600,
    });
}

describe("Videos API", () => {
  let accessToken: string;
  let forbiddenAccessToken: string;
  let lessonId: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser("Video", "Tester", authorizedEmail);
    await registerTestUser("Video", "Forbidden", forbiddenEmail);
    await grantVideoPermissions(authorizedEmail);
    const lesson = await createParentLesson(`videos-parent-${testRunId}`);

    const authorized = await getAuthToken(authorizedEmail, password);
    const forbidden = await getAuthToken(forbiddenEmail, password);

    accessToken = authorized.accessToken;
    forbiddenAccessToken = forbidden.accessToken;
    lessonId = lesson.id;
  });

  afterAll(async () => {
    await cleanupTestUser(authorizedEmail);
    await cleanupTestUser(forbiddenEmail);
  });

  describe("POST /api/videos", () => {
    it("creates a video", async () => {
      // Arrange
      const lesson = await createParentLesson(`create-${testRunId}`);

      // Act
      const response = await createVideo(accessToken, lesson.id, `create-${testRunId}`);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        lessonId: lesson.id,
        title: `create-${testRunId}`,
        sourceUrl: `https://example.com/create-${testRunId}.mp4`,
        playbackUrl: `https://example.com/create-${testRunId}.mp4`,
        durationSeconds: 600,
      });
    });

    it("rejects invalid payloads and missing lessons", async () => {
      // Act
      const invalid = await request(app)
        .post("/api/videos")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ lessonId: "bad-id", sourceUrl: "not-a-url" });
      const missingLesson = await createVideo(accessToken, "00000000-0000-0000-0000-000000000000", `missing-${testRunId}`);

      // Assert
      expect(invalid.status).toBe(400);
      expect(missingLesson.status).toBe(404);
    });

    it("rejects duplicate videos for the same lesson", async () => {
      // Act
      const first = await createVideo(accessToken, lessonId, `duplicate-a-${testRunId}`);
      const second = await createVideo(accessToken, lessonId, `duplicate-b-${testRunId}`);

      // Assert
      expect(first.status).toBe(201);
      expect(second.status).toBe(409);
    });

    it("rejects unauthenticated requests", async () => {
      // Act
      const response = await request(app).post("/api/videos").send({
        lessonId,
        sourceUrl: "https://example.com/unauthorized.mp4",
      });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe("video reads and updates", () => {
    it("lists, reads, updates, navigates, and deletes videos", async () => {
      // Arrange
      const previousLesson = await createParentLesson(`previous-${testRunId}`);
      const currentLesson = await createParentLesson(`current-${testRunId}`);
      const previous = await createVideo(accessToken, previousLesson.id, `previous-${testRunId}`);
      const current = await createVideo(accessToken, currentLesson.id, `current-${testRunId}`);

      // Act
      const list = await request(app).get("/api/videos").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
      const read = await request(app).get(`/api/videos/${current.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const byLesson = await request(app).get(`/api/videos/lessons/${currentLesson.id}`).set("Authorization", `Bearer ${accessToken}`);
      const previousResponse = await request(app).get(`/api/videos/${current.body.data.id}/previous`).set("Authorization", `Bearer ${accessToken}`);
      const nextResponse = await request(app).get(`/api/videos/${previous.body.data.id}/next`).set("Authorization", `Bearer ${accessToken}`);
      const update = await request(app)
        .patch(`/api/videos/${current.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Updated Video" });
      const deleteResponse = await request(app).delete(`/api/videos/${current.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const readDeleted = await request(app).get(`/api/videos/${current.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(list.status).toBe(200);
      expect(read.status).toBe(200);
      expect(byLesson.status).toBe(200);
      expect(previousResponse.status).toBe(200);
      expect(nextResponse.status).toBe(200);
      expect(update.status).toBe(200);
      expect(update.body.data.title).toBe("Updated Video");
      expect(deleteResponse.status).toBe(204);
      expect(readDeleted.status).toBe(404);
    });

    it("returns forbidden when the user lacks video permissions", async () => {
      // Act
      const response = await request(app).get("/api/videos").set("Authorization", `Bearer ${forbiddenAccessToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("chapters and subtitles", () => {
    it("creates, lists, reads, updates, and deletes chapters and subtitles", async () => {
      // Arrange
      const lesson = await createParentLesson(`assets-${testRunId}`);
      const video = await createVideo(accessToken, lesson.id, `assets-${testRunId}`);
      const videoId = video.body.data.id;

      // Act
      const chapter = await request(app)
        .post(`/api/videos/${videoId}/chapters`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Intro", startSecond: 0, sortOrder: 1 });
      const chapters = await request(app).get(`/api/videos/${videoId}/chapters`).set("Authorization", `Bearer ${accessToken}`);
      const chapterRead = await request(app).get(`/api/videos/${videoId}/chapters/${chapter.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const chapterUpdate = await request(app)
        .patch(`/api/videos/${videoId}/chapters/${chapter.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Updated Intro" });
      const subtitle = await request(app)
        .post(`/api/videos/${videoId}/subtitles`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ language: "en", label: "English", fileUrl: "https://example.com/en.vtt", isDefault: true });
      const subtitles = await request(app).get(`/api/videos/${videoId}/subtitles`).set("Authorization", `Bearer ${accessToken}`);
      const subtitleRead = await request(app).get(`/api/videos/${videoId}/subtitles/${subtitle.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const subtitleUpdate = await request(app)
        .patch(`/api/videos/${videoId}/subtitles/${subtitle.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ label: "Updated English" });
      const chapterDelete = await request(app).delete(`/api/videos/${videoId}/chapters/${chapter.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
      const subtitleDelete = await request(app).delete(`/api/videos/${videoId}/subtitles/${subtitle.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(chapter.status).toBe(201);
      expect(chapters.status).toBe(200);
      expect(chapterRead.status).toBe(200);
      expect(chapterUpdate.body.data.title).toBe("Updated Intro");
      expect(subtitle.status).toBe(201);
      expect(subtitles.status).toBe(200);
      expect(subtitleRead.status).toBe(200);
      expect(subtitleUpdate.body.data.label).toBe("Updated English");
      expect(chapterDelete.status).toBe(204);
      expect(subtitleDelete.status).toBe(204);
    });

    it("returns not found for missing chapter and subtitle records", async () => {
      // Arrange
      const lesson = await createParentLesson(`missing-assets-${testRunId}`);
      const video = await createVideo(accessToken, lesson.id, `missing-assets-${testRunId}`);

      // Act
      const chapter = await request(app)
        .get(`/api/videos/${video.body.data.id}/chapters/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", `Bearer ${accessToken}`);
      const subtitle = await request(app)
        .get(`/api/videos/${video.body.data.id}/subtitles/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(chapter.status).toBe(404);
      expect(subtitle.status).toBe(404);
    });
  });

  describe("statistics", () => {
    it("returns video statistics", async () => {
      // Act
      const response = await request(app).get("/api/videos/statistics").set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
