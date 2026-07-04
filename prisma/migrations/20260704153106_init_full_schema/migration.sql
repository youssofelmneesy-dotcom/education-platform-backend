/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `firstName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `lastName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[tenantId,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "tenantId" UUID NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "phone" VARCHAR(30),
    "avatarUrl" VARCHAR(500),
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" VARCHAR(50) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sessionHash" TEXT NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trusted_devices" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceFingerprintHash" TEXT NOT NULL,
    "deviceName" VARCHAR(100),
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "trustedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "trusted_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID,
    "email" VARCHAR(255) NOT NULL,
    "successful" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" VARCHAR(255),
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "description" TEXT,
    "shortDescription" VARCHAR(500),
    "thumbnailUrl" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "language" VARCHAR(20),
    "durationSeconds" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_categories" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "course_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_tags" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "course_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundles" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "description" TEXT,
    "shortDescription" VARCHAR(500),
    "thumbnailUrl" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_courses" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "bundleId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "bundle_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_instructors" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "course_instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_reviews" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" VARCHAR(200),
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "course_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_ratings" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "course_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_faqs" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "course_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_requirements" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "course_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_objectives" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "course_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_attachments" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "fileType" VARCHAR(100),
    "fileSize" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lesson_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "lessonId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_notes" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lesson_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "title" VARCHAR(200),
    "sourceUrl" VARCHAR(500) NOT NULL,
    "thumbnailUrl" VARCHAR(500),
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtitles" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "videoId" UUID NOT NULL,
    "language" VARCHAR(20) NOT NULL,
    "label" VARCHAR(100),
    "fileUrl" VARCHAR(500) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "subtitles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_chapters" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "videoId" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "startSecond" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "video_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_progress" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "videoId" UUID NOT NULL,
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "lastWatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "watch_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_history" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "videoId" UUID NOT NULL,
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "watch_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_banks" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID,
    "createdById" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "question_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "questionBankId" UUID NOT NULL,
    "createdById" UUID,
    "type" VARCHAR(50) NOT NULL,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choices" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "lessonId" UUID,
    "questionBankId" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "timeLimitMinutes" INTEGER,
    "passingScore" INTEGER,
    "maxAttempts" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_pools" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "question_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'in_progress',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examAttemptId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "answerText" TEXT,
    "selectedChoiceIds" TEXT[],
    "isCorrect" BOOLEAN,
    "pointsAwarded" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_results" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examId" UUID NOT NULL,
    "examAttemptId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "lessonId" UUID,
    "createdById" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "dueAt" TIMESTAMP(3),
    "maxScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'submitted',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_files" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "fileType" VARCHAR(100),
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "submission_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "graderId" UUID,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "feedback" TEXT,
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubrics" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "maxScore" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "templateId" UUID,
    "certificateNumber" VARCHAR(100) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_templates" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_verifications" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "certificateId" UUID NOT NULL,
    "verificationCode" VARCHAR(100) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "certificate_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "orderNumber" VARCHAR(100) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "currency" VARCHAR(3) NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "tax" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "courseId" UUID,
    "bundleId" UUID,
    "itemType" VARCHAR(30) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "providerTransactionId" VARCHAR(255),
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "currency" VARCHAR(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "discountType" VARCHAR(30) NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "maxRedemptions" INTEGER,
    "perUserLimit" INTEGER,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_usages" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "couponId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "discountAmount" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_cards" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purchaserId" UUID,
    "redeemedById" UUID,
    "currency" VARCHAR(3) NOT NULL,
    "initialBalance" INTEGER NOT NULL,
    "currentBalance" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "courseId" UUID,
    "bundleId" UUID,
    "provider" VARCHAR(50),
    "providerSubscriptionId" VARCHAR(255),
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "orderId" UUID,
    "subscriptionId" UUID,
    "invoiceNumber" VARCHAR(100) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'open',
    "currency" VARCHAR(3) NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "paymentId" UUID,
    "userId" UUID NOT NULL,
    "providerRefundId" VARCHAR(255),
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "currency" VARCHAR(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_isActive_idx" ON "tenants"("isActive");

-- CreateIndex
CREATE INDEX "tenants_deletedAt_idx" ON "tenants"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "profiles_tenantId_idx" ON "profiles"("tenantId");

-- CreateIndex
CREATE INDEX "profiles_tenantId_deletedAt_idx" ON "profiles"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "profiles_deletedAt_idx" ON "profiles"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_tenantId_userId_key" ON "profiles"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "roles_tenantId_idx" ON "roles"("tenantId");

-- CreateIndex
CREATE INDEX "roles_tenantId_deletedAt_idx" ON "roles"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "roles_deletedAt_idx" ON "roles"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenantId_name_key" ON "roles"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenantId_id_key" ON "roles"("tenantId", "id");

-- CreateIndex
CREATE INDEX "permissions_tenantId_idx" ON "permissions"("tenantId");

-- CreateIndex
CREATE INDEX "permissions_tenantId_deletedAt_idx" ON "permissions"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "permissions_deletedAt_idx" ON "permissions"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_tenantId_resource_action_key" ON "permissions"("tenantId", "resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_tenantId_id_key" ON "permissions"("tenantId", "id");

-- CreateIndex
CREATE INDEX "user_roles_tenantId_idx" ON "user_roles"("tenantId");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE INDEX "user_roles_tenantId_deletedAt_idx" ON "user_roles"("tenantId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_tenantId_userId_roleId_key" ON "user_roles"("tenantId", "userId", "roleId");

-- CreateIndex
CREATE INDEX "role_permissions_tenantId_idx" ON "role_permissions"("tenantId");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permissionId");

-- CreateIndex
CREATE INDEX "role_permissions_tenantId_deletedAt_idx" ON "role_permissions"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "role_permissions_deletedAt_idx" ON "role_permissions"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_tenantId_roleId_permissionId_key" ON "role_permissions"("tenantId", "roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_tenantId_idx" ON "refresh_tokens"("tenantId");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_revokedAt_idx" ON "refresh_tokens"("revokedAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_tenantId_userId_idx" ON "refresh_tokens"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_tenantId_deletedAt_idx" ON "refresh_tokens"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_deletedAt_idx" ON "refresh_tokens"("deletedAt");

-- CreateIndex
CREATE INDEX "otps_tenantId_idx" ON "otps"("tenantId");

-- CreateIndex
CREATE INDEX "otps_userId_idx" ON "otps"("userId");

-- CreateIndex
CREATE INDEX "otps_purpose_idx" ON "otps"("purpose");

-- CreateIndex
CREATE INDEX "otps_expiresAt_idx" ON "otps"("expiresAt");

-- CreateIndex
CREATE INDEX "otps_tenantId_userId_purpose_idx" ON "otps"("tenantId", "userId", "purpose");

-- CreateIndex
CREATE INDEX "otps_tenantId_deletedAt_idx" ON "otps"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "otps_deletedAt_idx" ON "otps"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionHash_key" ON "user_sessions"("sessionHash");

-- CreateIndex
CREATE INDEX "user_sessions_tenantId_idx" ON "user_sessions"("tenantId");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "user_sessions_revokedAt_idx" ON "user_sessions"("revokedAt");

-- CreateIndex
CREATE INDEX "user_sessions_tenantId_userId_idx" ON "user_sessions"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "user_sessions_tenantId_deletedAt_idx" ON "user_sessions"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "user_sessions_deletedAt_idx" ON "user_sessions"("deletedAt");

-- CreateIndex
CREATE INDEX "trusted_devices_tenantId_idx" ON "trusted_devices"("tenantId");

-- CreateIndex
CREATE INDEX "trusted_devices_userId_idx" ON "trusted_devices"("userId");

-- CreateIndex
CREATE INDEX "trusted_devices_revokedAt_idx" ON "trusted_devices"("revokedAt");

-- CreateIndex
CREATE INDEX "trusted_devices_tenantId_userId_idx" ON "trusted_devices"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "trusted_devices_tenantId_deletedAt_idx" ON "trusted_devices"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "trusted_devices_deletedAt_idx" ON "trusted_devices"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "trusted_devices_tenantId_userId_deviceFingerprintHash_key" ON "trusted_devices"("tenantId", "userId", "deviceFingerprintHash");

-- CreateIndex
CREATE INDEX "login_history_tenantId_idx" ON "login_history"("tenantId");

-- CreateIndex
CREATE INDEX "login_history_userId_idx" ON "login_history"("userId");

-- CreateIndex
CREATE INDEX "login_history_email_idx" ON "login_history"("email");

-- CreateIndex
CREATE INDEX "login_history_successful_idx" ON "login_history"("successful");

-- CreateIndex
CREATE INDEX "login_history_createdAt_idx" ON "login_history"("createdAt");

-- CreateIndex
CREATE INDEX "login_history_tenantId_email_idx" ON "login_history"("tenantId", "email");

-- CreateIndex
CREATE INDEX "login_history_tenantId_userId_idx" ON "login_history"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "login_history_tenantId_deletedAt_idx" ON "login_history"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "login_history_deletedAt_idx" ON "login_history"("deletedAt");

-- CreateIndex
CREATE INDEX "categories_tenantId_idx" ON "categories"("tenantId");

-- CreateIndex
CREATE INDEX "categories_tenantId_deletedAt_idx" ON "categories"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "categories_deletedAt_idx" ON "categories"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "categories_tenantId_slug_key" ON "categories"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_tenantId_id_key" ON "categories"("tenantId", "id");

-- CreateIndex
CREATE INDEX "tags_tenantId_idx" ON "tags"("tenantId");

-- CreateIndex
CREATE INDEX "tags_tenantId_deletedAt_idx" ON "tags"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "tags_deletedAt_idx" ON "tags"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tenantId_slug_key" ON "tags"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tenantId_id_key" ON "tags"("tenantId", "id");

-- CreateIndex
CREATE INDEX "courses_tenantId_idx" ON "courses"("tenantId");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "courses"("status");

-- CreateIndex
CREATE INDEX "courses_publishedAt_idx" ON "courses"("publishedAt");

-- CreateIndex
CREATE INDEX "courses_tenantId_deletedAt_idx" ON "courses"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "courses_deletedAt_idx" ON "courses"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "courses_tenantId_slug_key" ON "courses"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "courses_tenantId_id_key" ON "courses"("tenantId", "id");

-- CreateIndex
CREATE INDEX "course_categories_tenantId_idx" ON "course_categories"("tenantId");

-- CreateIndex
CREATE INDEX "course_categories_courseId_idx" ON "course_categories"("courseId");

-- CreateIndex
CREATE INDEX "course_categories_categoryId_idx" ON "course_categories"("categoryId");

-- CreateIndex
CREATE INDEX "course_categories_tenantId_deletedAt_idx" ON "course_categories"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "course_categories_deletedAt_idx" ON "course_categories"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "course_categories_tenantId_courseId_categoryId_key" ON "course_categories"("tenantId", "courseId", "categoryId");

-- CreateIndex
CREATE INDEX "course_tags_tenantId_idx" ON "course_tags"("tenantId");

-- CreateIndex
CREATE INDEX "course_tags_courseId_idx" ON "course_tags"("courseId");

-- CreateIndex
CREATE INDEX "course_tags_tagId_idx" ON "course_tags"("tagId");

-- CreateIndex
CREATE INDEX "course_tags_tenantId_deletedAt_idx" ON "course_tags"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "course_tags_deletedAt_idx" ON "course_tags"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "course_tags_tenantId_courseId_tagId_key" ON "course_tags"("tenantId", "courseId", "tagId");

-- CreateIndex
CREATE INDEX "bundles_tenantId_idx" ON "bundles"("tenantId");

-- CreateIndex
CREATE INDEX "bundles_status_idx" ON "bundles"("status");

-- CreateIndex
CREATE INDEX "bundles_publishedAt_idx" ON "bundles"("publishedAt");

-- CreateIndex
CREATE INDEX "bundles_tenantId_deletedAt_idx" ON "bundles"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "bundles_deletedAt_idx" ON "bundles"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "bundles_tenantId_slug_key" ON "bundles"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "bundles_tenantId_id_key" ON "bundles"("tenantId", "id");

-- CreateIndex
CREATE INDEX "bundle_courses_tenantId_idx" ON "bundle_courses"("tenantId");

-- CreateIndex
CREATE INDEX "bundle_courses_bundleId_idx" ON "bundle_courses"("bundleId");

-- CreateIndex
CREATE INDEX "bundle_courses_courseId_idx" ON "bundle_courses"("courseId");

-- CreateIndex
CREATE INDEX "bundle_courses_tenantId_bundleId_sortOrder_idx" ON "bundle_courses"("tenantId", "bundleId", "sortOrder");

-- CreateIndex
CREATE INDEX "bundle_courses_tenantId_deletedAt_idx" ON "bundle_courses"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "bundle_courses_deletedAt_idx" ON "bundle_courses"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_courses_tenantId_bundleId_courseId_key" ON "bundle_courses"("tenantId", "bundleId", "courseId");

-- CreateIndex
CREATE INDEX "course_instructors_tenantId_idx" ON "course_instructors"("tenantId");

-- CreateIndex
CREATE INDEX "course_instructors_courseId_idx" ON "course_instructors"("courseId");

-- CreateIndex
CREATE INDEX "course_instructors_userId_idx" ON "course_instructors"("userId");

-- CreateIndex
CREATE INDEX "course_instructors_tenantId_deletedAt_idx" ON "course_instructors"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "course_instructors_deletedAt_idx" ON "course_instructors"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "course_instructors_tenantId_courseId_userId_key" ON "course_instructors"("tenantId", "courseId", "userId");

-- CreateIndex
CREATE INDEX "course_reviews_tenantId_idx" ON "course_reviews"("tenantId");

-- CreateIndex
CREATE INDEX "course_reviews_courseId_idx" ON "course_reviews"("courseId");

-- CreateIndex
CREATE INDEX "course_reviews_userId_idx" ON "course_reviews"("userId");

-- CreateIndex
CREATE INDEX "course_reviews_isApproved_idx" ON "course_reviews"("isApproved");

-- CreateIndex
CREATE INDEX "course_reviews_tenantId_deletedAt_idx" ON "course_reviews"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "course_reviews_deletedAt_idx" ON "course_reviews"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "course_reviews_tenantId_courseId_userId_key" ON "course_reviews"("tenantId", "courseId", "userId");

-- CreateIndex
CREATE INDEX "course_ratings_tenantId_idx" ON "course_ratings"("tenantId");

-- CreateIndex
CREATE INDEX "course_ratings_courseId_idx" ON "course_ratings"("courseId");

-- CreateIndex
CREATE INDEX "course_ratings_userId_idx" ON "course_ratings"("userId");

-- CreateIndex
CREATE INDEX "course_ratings_value_idx" ON "course_ratings"("value");

-- CreateIndex
CREATE INDEX "course_ratings_tenantId_deletedAt_idx" ON "course_ratings"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "course_ratings_deletedAt_idx" ON "course_ratings"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "course_ratings_tenantId_courseId_userId_key" ON "course_ratings"("tenantId", "courseId", "userId");

-- CreateIndex
CREATE INDEX "course_faqs_tenantId_idx" ON "course_faqs"("tenantId");

-- CreateIndex
CREATE INDEX "course_faqs_courseId_idx" ON "course_faqs"("courseId");

-- CreateIndex
CREATE INDEX "course_faqs_tenantId_courseId_sortOrder_idx" ON "course_faqs"("tenantId", "courseId", "sortOrder");

-- CreateIndex
CREATE INDEX "course_faqs_tenantId_deletedAt_idx" ON "course_faqs"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "course_faqs_deletedAt_idx" ON "course_faqs"("deletedAt");

-- CreateIndex
CREATE INDEX "course_requirements_tenantId_idx" ON "course_requirements"("tenantId");

-- CreateIndex
CREATE INDEX "course_requirements_courseId_idx" ON "course_requirements"("courseId");

-- CreateIndex
CREATE INDEX "course_requirements_tenantId_courseId_sortOrder_idx" ON "course_requirements"("tenantId", "courseId", "sortOrder");

-- CreateIndex
CREATE INDEX "course_requirements_tenantId_deletedAt_idx" ON "course_requirements"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "course_requirements_deletedAt_idx" ON "course_requirements"("deletedAt");

-- CreateIndex
CREATE INDEX "course_objectives_tenantId_idx" ON "course_objectives"("tenantId");

-- CreateIndex
CREATE INDEX "course_objectives_courseId_idx" ON "course_objectives"("courseId");

-- CreateIndex
CREATE INDEX "course_objectives_tenantId_courseId_sortOrder_idx" ON "course_objectives"("tenantId", "courseId", "sortOrder");

-- CreateIndex
CREATE INDEX "course_objectives_tenantId_deletedAt_idx" ON "course_objectives"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "course_objectives_deletedAt_idx" ON "course_objectives"("deletedAt");

-- CreateIndex
CREATE INDEX "lessons_tenantId_idx" ON "lessons"("tenantId");

-- CreateIndex
CREATE INDEX "lessons_courseId_idx" ON "lessons"("courseId");

-- CreateIndex
CREATE INDEX "lessons_publishedAt_idx" ON "lessons"("publishedAt");

-- CreateIndex
CREATE INDEX "lessons_tenantId_courseId_sortOrder_idx" ON "lessons"("tenantId", "courseId", "sortOrder");

-- CreateIndex
CREATE INDEX "lessons_tenantId_deletedAt_idx" ON "lessons"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "lessons_deletedAt_idx" ON "lessons"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_tenantId_courseId_slug_key" ON "lessons"("tenantId", "courseId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_tenantId_id_key" ON "lessons"("tenantId", "id");

-- CreateIndex
CREATE INDEX "lesson_attachments_tenantId_idx" ON "lesson_attachments"("tenantId");

-- CreateIndex
CREATE INDEX "lesson_attachments_lessonId_idx" ON "lesson_attachments"("lessonId");

-- CreateIndex
CREATE INDEX "lesson_attachments_tenantId_lessonId_sortOrder_idx" ON "lesson_attachments"("tenantId", "lessonId", "sortOrder");

-- CreateIndex
CREATE INDEX "lesson_attachments_tenantId_deletedAt_idx" ON "lesson_attachments"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "lesson_attachments_deletedAt_idx" ON "lesson_attachments"("deletedAt");

-- CreateIndex
CREATE INDEX "bookmarks_tenantId_idx" ON "bookmarks"("tenantId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_idx" ON "bookmarks"("userId");

-- CreateIndex
CREATE INDEX "bookmarks_courseId_idx" ON "bookmarks"("courseId");

-- CreateIndex
CREATE INDEX "bookmarks_lessonId_idx" ON "bookmarks"("lessonId");

-- CreateIndex
CREATE INDEX "bookmarks_tenantId_userId_idx" ON "bookmarks"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "bookmarks_tenantId_deletedAt_idx" ON "bookmarks"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "bookmarks_deletedAt_idx" ON "bookmarks"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_tenantId_userId_courseId_lessonId_key" ON "bookmarks"("tenantId", "userId", "courseId", "lessonId");

-- CreateIndex
CREATE INDEX "lesson_notes_tenantId_idx" ON "lesson_notes"("tenantId");

-- CreateIndex
CREATE INDEX "lesson_notes_userId_idx" ON "lesson_notes"("userId");

-- CreateIndex
CREATE INDEX "lesson_notes_lessonId_idx" ON "lesson_notes"("lessonId");

-- CreateIndex
CREATE INDEX "lesson_notes_tenantId_userId_lessonId_idx" ON "lesson_notes"("tenantId", "userId", "lessonId");

-- CreateIndex
CREATE INDEX "lesson_notes_tenantId_deletedAt_idx" ON "lesson_notes"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "lesson_notes_deletedAt_idx" ON "lesson_notes"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "videos_lessonId_key" ON "videos"("lessonId");

-- CreateIndex
CREATE INDEX "videos_tenantId_idx" ON "videos"("tenantId");

-- CreateIndex
CREATE INDEX "videos_tenantId_deletedAt_idx" ON "videos"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "videos_deletedAt_idx" ON "videos"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "videos_tenantId_lessonId_key" ON "videos"("tenantId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "videos_tenantId_id_key" ON "videos"("tenantId", "id");

-- CreateIndex
CREATE INDEX "subtitles_tenantId_idx" ON "subtitles"("tenantId");

-- CreateIndex
CREATE INDEX "subtitles_videoId_idx" ON "subtitles"("videoId");

-- CreateIndex
CREATE INDEX "subtitles_tenantId_deletedAt_idx" ON "subtitles"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "subtitles_deletedAt_idx" ON "subtitles"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "subtitles_tenantId_videoId_language_key" ON "subtitles"("tenantId", "videoId", "language");

-- CreateIndex
CREATE INDEX "video_chapters_tenantId_idx" ON "video_chapters"("tenantId");

-- CreateIndex
CREATE INDEX "video_chapters_videoId_idx" ON "video_chapters"("videoId");

-- CreateIndex
CREATE INDEX "video_chapters_tenantId_videoId_sortOrder_idx" ON "video_chapters"("tenantId", "videoId", "sortOrder");

-- CreateIndex
CREATE INDEX "video_chapters_tenantId_deletedAt_idx" ON "video_chapters"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "video_chapters_deletedAt_idx" ON "video_chapters"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "video_chapters_tenantId_videoId_startSecond_key" ON "video_chapters"("tenantId", "videoId", "startSecond");

-- CreateIndex
CREATE INDEX "watch_progress_tenantId_idx" ON "watch_progress"("tenantId");

-- CreateIndex
CREATE INDEX "watch_progress_userId_idx" ON "watch_progress"("userId");

-- CreateIndex
CREATE INDEX "watch_progress_videoId_idx" ON "watch_progress"("videoId");

-- CreateIndex
CREATE INDEX "watch_progress_completedAt_idx" ON "watch_progress"("completedAt");

-- CreateIndex
CREATE INDEX "watch_progress_lastWatchedAt_idx" ON "watch_progress"("lastWatchedAt");

-- CreateIndex
CREATE INDEX "watch_progress_tenantId_userId_idx" ON "watch_progress"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "watch_progress_tenantId_deletedAt_idx" ON "watch_progress"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "watch_progress_deletedAt_idx" ON "watch_progress"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "watch_progress_tenantId_userId_videoId_key" ON "watch_progress"("tenantId", "userId", "videoId");

-- CreateIndex
CREATE INDEX "watch_history_tenantId_idx" ON "watch_history"("tenantId");

-- CreateIndex
CREATE INDEX "watch_history_userId_idx" ON "watch_history"("userId");

-- CreateIndex
CREATE INDEX "watch_history_videoId_idx" ON "watch_history"("videoId");

-- CreateIndex
CREATE INDEX "watch_history_watchedAt_idx" ON "watch_history"("watchedAt");

-- CreateIndex
CREATE INDEX "watch_history_tenantId_userId_idx" ON "watch_history"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "watch_history_tenantId_deletedAt_idx" ON "watch_history"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "watch_history_deletedAt_idx" ON "watch_history"("deletedAt");

-- CreateIndex
CREATE INDEX "question_banks_tenantId_idx" ON "question_banks"("tenantId");

-- CreateIndex
CREATE INDEX "question_banks_courseId_idx" ON "question_banks"("courseId");

-- CreateIndex
CREATE INDEX "question_banks_createdById_idx" ON "question_banks"("createdById");

-- CreateIndex
CREATE INDEX "question_banks_tenantId_courseId_idx" ON "question_banks"("tenantId", "courseId");

-- CreateIndex
CREATE INDEX "question_banks_tenantId_deletedAt_idx" ON "question_banks"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "question_banks_deletedAt_idx" ON "question_banks"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "question_banks_tenantId_id_key" ON "question_banks"("tenantId", "id");

-- CreateIndex
CREATE INDEX "questions_tenantId_idx" ON "questions"("tenantId");

-- CreateIndex
CREATE INDEX "questions_questionBankId_idx" ON "questions"("questionBankId");

-- CreateIndex
CREATE INDEX "questions_createdById_idx" ON "questions"("createdById");

-- CreateIndex
CREATE INDEX "questions_type_idx" ON "questions"("type");

-- CreateIndex
CREATE INDEX "questions_tenantId_questionBankId_sortOrder_idx" ON "questions"("tenantId", "questionBankId", "sortOrder");

-- CreateIndex
CREATE INDEX "questions_tenantId_deletedAt_idx" ON "questions"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "questions_deletedAt_idx" ON "questions"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "questions_tenantId_id_key" ON "questions"("tenantId", "id");

-- CreateIndex
CREATE INDEX "choices_tenantId_idx" ON "choices"("tenantId");

-- CreateIndex
CREATE INDEX "choices_questionId_idx" ON "choices"("questionId");

-- CreateIndex
CREATE INDEX "choices_tenantId_questionId_sortOrder_idx" ON "choices"("tenantId", "questionId", "sortOrder");

-- CreateIndex
CREATE INDEX "choices_tenantId_deletedAt_idx" ON "choices"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "choices_deletedAt_idx" ON "choices"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "choices_tenantId_id_key" ON "choices"("tenantId", "id");

-- CreateIndex
CREATE INDEX "exams_tenantId_idx" ON "exams"("tenantId");

-- CreateIndex
CREATE INDEX "exams_courseId_idx" ON "exams"("courseId");

-- CreateIndex
CREATE INDEX "exams_lessonId_idx" ON "exams"("lessonId");

-- CreateIndex
CREATE INDEX "exams_questionBankId_idx" ON "exams"("questionBankId");

-- CreateIndex
CREATE INDEX "exams_status_idx" ON "exams"("status");

-- CreateIndex
CREATE INDEX "exams_startsAt_idx" ON "exams"("startsAt");

-- CreateIndex
CREATE INDEX "exams_endsAt_idx" ON "exams"("endsAt");

-- CreateIndex
CREATE INDEX "exams_tenantId_courseId_idx" ON "exams"("tenantId", "courseId");

-- CreateIndex
CREATE INDEX "exams_tenantId_deletedAt_idx" ON "exams"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "exams_deletedAt_idx" ON "exams"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "exams_tenantId_id_key" ON "exams"("tenantId", "id");

-- CreateIndex
CREATE INDEX "question_pools_tenantId_idx" ON "question_pools"("tenantId");

-- CreateIndex
CREATE INDEX "question_pools_examId_idx" ON "question_pools"("examId");

-- CreateIndex
CREATE INDEX "question_pools_questionId_idx" ON "question_pools"("questionId");

-- CreateIndex
CREATE INDEX "question_pools_tenantId_examId_sortOrder_idx" ON "question_pools"("tenantId", "examId", "sortOrder");

-- CreateIndex
CREATE INDEX "question_pools_tenantId_deletedAt_idx" ON "question_pools"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "question_pools_deletedAt_idx" ON "question_pools"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "question_pools_tenantId_examId_questionId_key" ON "question_pools"("tenantId", "examId", "questionId");

-- CreateIndex
CREATE INDEX "exam_attempts_tenantId_idx" ON "exam_attempts"("tenantId");

-- CreateIndex
CREATE INDEX "exam_attempts_examId_idx" ON "exam_attempts"("examId");

-- CreateIndex
CREATE INDEX "exam_attempts_userId_idx" ON "exam_attempts"("userId");

-- CreateIndex
CREATE INDEX "exam_attempts_status_idx" ON "exam_attempts"("status");

-- CreateIndex
CREATE INDEX "exam_attempts_submittedAt_idx" ON "exam_attempts"("submittedAt");

-- CreateIndex
CREATE INDEX "exam_attempts_tenantId_userId_idx" ON "exam_attempts"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "exam_attempts_tenantId_deletedAt_idx" ON "exam_attempts"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "exam_attempts_deletedAt_idx" ON "exam_attempts"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempts_tenantId_examId_userId_attemptNumber_key" ON "exam_attempts"("tenantId", "examId", "userId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempts_tenantId_id_key" ON "exam_attempts"("tenantId", "id");

-- CreateIndex
CREATE INDEX "student_answers_tenantId_idx" ON "student_answers"("tenantId");

-- CreateIndex
CREATE INDEX "student_answers_examAttemptId_idx" ON "student_answers"("examAttemptId");

-- CreateIndex
CREATE INDEX "student_answers_questionId_idx" ON "student_answers"("questionId");

-- CreateIndex
CREATE INDEX "student_answers_userId_idx" ON "student_answers"("userId");

-- CreateIndex
CREATE INDEX "student_answers_isCorrect_idx" ON "student_answers"("isCorrect");

-- CreateIndex
CREATE INDEX "student_answers_tenantId_userId_idx" ON "student_answers"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "student_answers_tenantId_deletedAt_idx" ON "student_answers"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "student_answers_deletedAt_idx" ON "student_answers"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "student_answers_tenantId_examAttemptId_questionId_key" ON "student_answers"("tenantId", "examAttemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_examAttemptId_key" ON "exam_results"("examAttemptId");

-- CreateIndex
CREATE INDEX "exam_results_tenantId_idx" ON "exam_results"("tenantId");

-- CreateIndex
CREATE INDEX "exam_results_examId_idx" ON "exam_results"("examId");

-- CreateIndex
CREATE INDEX "exam_results_userId_idx" ON "exam_results"("userId");

-- CreateIndex
CREATE INDEX "exam_results_passed_idx" ON "exam_results"("passed");

-- CreateIndex
CREATE INDEX "exam_results_gradedAt_idx" ON "exam_results"("gradedAt");

-- CreateIndex
CREATE INDEX "exam_results_tenantId_userId_idx" ON "exam_results"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "exam_results_tenantId_deletedAt_idx" ON "exam_results"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "exam_results_deletedAt_idx" ON "exam_results"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_tenantId_examAttemptId_key" ON "exam_results"("tenantId", "examAttemptId");

-- CreateIndex
CREATE INDEX "assignments_tenantId_idx" ON "assignments"("tenantId");

-- CreateIndex
CREATE INDEX "assignments_courseId_idx" ON "assignments"("courseId");

-- CreateIndex
CREATE INDEX "assignments_lessonId_idx" ON "assignments"("lessonId");

-- CreateIndex
CREATE INDEX "assignments_createdById_idx" ON "assignments"("createdById");

-- CreateIndex
CREATE INDEX "assignments_status_idx" ON "assignments"("status");

-- CreateIndex
CREATE INDEX "assignments_dueAt_idx" ON "assignments"("dueAt");

-- CreateIndex
CREATE INDEX "assignments_tenantId_courseId_idx" ON "assignments"("tenantId", "courseId");

-- CreateIndex
CREATE INDEX "assignments_tenantId_deletedAt_idx" ON "assignments"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "assignments_deletedAt_idx" ON "assignments"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_tenantId_id_key" ON "assignments"("tenantId", "id");

-- CreateIndex
CREATE INDEX "submissions_tenantId_idx" ON "submissions"("tenantId");

-- CreateIndex
CREATE INDEX "submissions_assignmentId_idx" ON "submissions"("assignmentId");

-- CreateIndex
CREATE INDEX "submissions_userId_idx" ON "submissions"("userId");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "submissions_submittedAt_idx" ON "submissions"("submittedAt");

-- CreateIndex
CREATE INDEX "submissions_tenantId_userId_idx" ON "submissions"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "submissions_tenantId_deletedAt_idx" ON "submissions"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "submissions_deletedAt_idx" ON "submissions"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_tenantId_assignmentId_userId_key" ON "submissions"("tenantId", "assignmentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_tenantId_id_key" ON "submissions"("tenantId", "id");

-- CreateIndex
CREATE INDEX "submission_files_tenantId_idx" ON "submission_files"("tenantId");

-- CreateIndex
CREATE INDEX "submission_files_submissionId_idx" ON "submission_files"("submissionId");

-- CreateIndex
CREATE INDEX "submission_files_tenantId_deletedAt_idx" ON "submission_files"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "submission_files_deletedAt_idx" ON "submission_files"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "grades_submissionId_key" ON "grades"("submissionId");

-- CreateIndex
CREATE INDEX "grades_tenantId_idx" ON "grades"("tenantId");

-- CreateIndex
CREATE INDEX "grades_studentId_idx" ON "grades"("studentId");

-- CreateIndex
CREATE INDEX "grades_graderId_idx" ON "grades"("graderId");

-- CreateIndex
CREATE INDEX "grades_gradedAt_idx" ON "grades"("gradedAt");

-- CreateIndex
CREATE INDEX "grades_tenantId_studentId_idx" ON "grades"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "grades_tenantId_deletedAt_idx" ON "grades"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "grades_deletedAt_idx" ON "grades"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "grades_tenantId_submissionId_key" ON "grades"("tenantId", "submissionId");

-- CreateIndex
CREATE INDEX "rubrics_tenantId_idx" ON "rubrics"("tenantId");

-- CreateIndex
CREATE INDEX "rubrics_assignmentId_idx" ON "rubrics"("assignmentId");

-- CreateIndex
CREATE INDEX "rubrics_tenantId_assignmentId_sortOrder_idx" ON "rubrics"("tenantId", "assignmentId", "sortOrder");

-- CreateIndex
CREATE INDEX "rubrics_tenantId_deletedAt_idx" ON "rubrics"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "rubrics_deletedAt_idx" ON "rubrics"("deletedAt");

-- CreateIndex
CREATE INDEX "certificates_tenantId_idx" ON "certificates"("tenantId");

-- CreateIndex
CREATE INDEX "certificates_courseId_idx" ON "certificates"("courseId");

-- CreateIndex
CREATE INDEX "certificates_userId_idx" ON "certificates"("userId");

-- CreateIndex
CREATE INDEX "certificates_templateId_idx" ON "certificates"("templateId");

-- CreateIndex
CREATE INDEX "certificates_issuedAt_idx" ON "certificates"("issuedAt");

-- CreateIndex
CREATE INDEX "certificates_expiresAt_idx" ON "certificates"("expiresAt");

-- CreateIndex
CREATE INDEX "certificates_revokedAt_idx" ON "certificates"("revokedAt");

-- CreateIndex
CREATE INDEX "certificates_tenantId_deletedAt_idx" ON "certificates"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "certificates_deletedAt_idx" ON "certificates"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_tenantId_certificateNumber_key" ON "certificates"("tenantId", "certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_tenantId_courseId_userId_key" ON "certificates"("tenantId", "courseId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_tenantId_id_key" ON "certificates"("tenantId", "id");

-- CreateIndex
CREATE INDEX "certificate_templates_tenantId_idx" ON "certificate_templates"("tenantId");

-- CreateIndex
CREATE INDEX "certificate_templates_isDefault_idx" ON "certificate_templates"("isDefault");

-- CreateIndex
CREATE INDEX "certificate_templates_tenantId_deletedAt_idx" ON "certificate_templates"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "certificate_templates_deletedAt_idx" ON "certificate_templates"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_templates_tenantId_name_key" ON "certificate_templates"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_templates_tenantId_id_key" ON "certificate_templates"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_verifications_certificateId_key" ON "certificate_verifications"("certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_verifications_verificationCode_key" ON "certificate_verifications"("verificationCode");

-- CreateIndex
CREATE INDEX "certificate_verifications_tenantId_idx" ON "certificate_verifications"("tenantId");

-- CreateIndex
CREATE INDEX "certificate_verifications_verifiedAt_idx" ON "certificate_verifications"("verifiedAt");

-- CreateIndex
CREATE INDEX "certificate_verifications_tenantId_deletedAt_idx" ON "certificate_verifications"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "certificate_verifications_deletedAt_idx" ON "certificate_verifications"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_verifications_tenantId_certificateId_key" ON "certificate_verifications"("tenantId", "certificateId");

-- CreateIndex
CREATE INDEX "orders_tenantId_idx" ON "orders"("tenantId");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "orders_tenantId_userId_idx" ON "orders"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "orders_tenantId_deletedAt_idx" ON "orders"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "orders_deletedAt_idx" ON "orders"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_tenantId_orderNumber_key" ON "orders"("tenantId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "orders_tenantId_id_key" ON "orders"("tenantId", "id");

-- CreateIndex
CREATE INDEX "order_items_tenantId_idx" ON "order_items"("tenantId");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_courseId_idx" ON "order_items"("courseId");

-- CreateIndex
CREATE INDEX "order_items_bundleId_idx" ON "order_items"("bundleId");

-- CreateIndex
CREATE INDEX "order_items_itemType_idx" ON "order_items"("itemType");

-- CreateIndex
CREATE INDEX "order_items_tenantId_orderId_idx" ON "order_items"("tenantId", "orderId");

-- CreateIndex
CREATE INDEX "order_items_tenantId_deletedAt_idx" ON "order_items"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "order_items_deletedAt_idx" ON "order_items"("deletedAt");

-- CreateIndex
CREATE INDEX "payments_tenantId_idx" ON "payments"("tenantId");

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_provider_idx" ON "payments"("provider");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paidAt_idx" ON "payments"("paidAt");

-- CreateIndex
CREATE INDEX "payments_tenantId_orderId_idx" ON "payments"("tenantId", "orderId");

-- CreateIndex
CREATE INDEX "payments_tenantId_deletedAt_idx" ON "payments"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "payments_deletedAt_idx" ON "payments"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_tenantId_provider_providerTransactionId_key" ON "payments"("tenantId", "provider", "providerTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_tenantId_id_key" ON "payments"("tenantId", "id");

-- CreateIndex
CREATE INDEX "coupons_tenantId_idx" ON "coupons"("tenantId");

-- CreateIndex
CREATE INDEX "coupons_isActive_idx" ON "coupons"("isActive");

-- CreateIndex
CREATE INDEX "coupons_startsAt_idx" ON "coupons"("startsAt");

-- CreateIndex
CREATE INDEX "coupons_expiresAt_idx" ON "coupons"("expiresAt");

-- CreateIndex
CREATE INDEX "coupons_tenantId_deletedAt_idx" ON "coupons"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "coupons_deletedAt_idx" ON "coupons"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_tenantId_code_key" ON "coupons"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_tenantId_id_key" ON "coupons"("tenantId", "id");

-- CreateIndex
CREATE INDEX "coupon_usages_tenantId_idx" ON "coupon_usages"("tenantId");

-- CreateIndex
CREATE INDEX "coupon_usages_couponId_idx" ON "coupon_usages"("couponId");

-- CreateIndex
CREATE INDEX "coupon_usages_orderId_idx" ON "coupon_usages"("orderId");

-- CreateIndex
CREATE INDEX "coupon_usages_userId_idx" ON "coupon_usages"("userId");

-- CreateIndex
CREATE INDEX "coupon_usages_usedAt_idx" ON "coupon_usages"("usedAt");

-- CreateIndex
CREATE INDEX "coupon_usages_tenantId_userId_idx" ON "coupon_usages"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "coupon_usages_tenantId_deletedAt_idx" ON "coupon_usages"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "coupon_usages_deletedAt_idx" ON "coupon_usages"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_usages_tenantId_couponId_orderId_key" ON "coupon_usages"("tenantId", "couponId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_codeHash_key" ON "gift_cards"("codeHash");

-- CreateIndex
CREATE INDEX "gift_cards_tenantId_idx" ON "gift_cards"("tenantId");

-- CreateIndex
CREATE INDEX "gift_cards_purchaserId_idx" ON "gift_cards"("purchaserId");

-- CreateIndex
CREATE INDEX "gift_cards_redeemedById_idx" ON "gift_cards"("redeemedById");

-- CreateIndex
CREATE INDEX "gift_cards_expiresAt_idx" ON "gift_cards"("expiresAt");

-- CreateIndex
CREATE INDEX "gift_cards_redeemedAt_idx" ON "gift_cards"("redeemedAt");

-- CreateIndex
CREATE INDEX "gift_cards_tenantId_deletedAt_idx" ON "gift_cards"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "gift_cards_deletedAt_idx" ON "gift_cards"("deletedAt");

-- CreateIndex
CREATE INDEX "subscriptions_tenantId_idx" ON "subscriptions"("tenantId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_courseId_idx" ON "subscriptions"("courseId");

-- CreateIndex
CREATE INDEX "subscriptions_bundleId_idx" ON "subscriptions"("bundleId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_currentPeriodEnd_idx" ON "subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "subscriptions_canceledAt_idx" ON "subscriptions"("canceledAt");

-- CreateIndex
CREATE INDEX "subscriptions_tenantId_userId_idx" ON "subscriptions"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "subscriptions_tenantId_deletedAt_idx" ON "subscriptions"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "subscriptions_deletedAt_idx" ON "subscriptions"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_tenantId_provider_providerSubscriptionId_key" ON "subscriptions"("tenantId", "provider", "providerSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_tenantId_id_key" ON "subscriptions"("tenantId", "id");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "invoices"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_userId_idx" ON "invoices"("userId");

-- CreateIndex
CREATE INDEX "invoices_orderId_idx" ON "invoices"("orderId");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_idx" ON "invoices"("subscriptionId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_dueAt_idx" ON "invoices"("dueAt");

-- CreateIndex
CREATE INDEX "invoices_paidAt_idx" ON "invoices"("paidAt");

-- CreateIndex
CREATE INDEX "invoices_tenantId_userId_idx" ON "invoices"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "invoices_tenantId_deletedAt_idx" ON "invoices"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "invoices_deletedAt_idx" ON "invoices"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenantId_invoiceNumber_key" ON "invoices"("tenantId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "refunds_tenantId_idx" ON "refunds"("tenantId");

-- CreateIndex
CREATE INDEX "refunds_orderId_idx" ON "refunds"("orderId");

-- CreateIndex
CREATE INDEX "refunds_paymentId_idx" ON "refunds"("paymentId");

-- CreateIndex
CREATE INDEX "refunds_userId_idx" ON "refunds"("userId");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- CreateIndex
CREATE INDEX "refunds_refundedAt_idx" ON "refunds"("refundedAt");

-- CreateIndex
CREATE INDEX "refunds_tenantId_userId_idx" ON "refunds"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "refunds_tenantId_deletedAt_idx" ON "refunds"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "refunds_deletedAt_idx" ON "refunds"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_tenantId_providerRefundId_key" ON "refunds"("tenantId", "providerRefundId");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_tenantId_deletedAt_idx" ON "users"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_id_key" ON "users"("tenantId", "id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_tenantId_roleId_fkey" FOREIGN KEY ("tenantId", "roleId") REFERENCES "roles"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenantId_roleId_fkey" FOREIGN KEY ("tenantId", "roleId") REFERENCES "roles"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenantId_permissionId_fkey" FOREIGN KEY ("tenantId", "permissionId") REFERENCES "permissions"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trusted_devices" ADD CONSTRAINT "trusted_devices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trusted_devices" ADD CONSTRAINT "trusted_devices_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_tenantId_categoryId_fkey" FOREIGN KEY ("tenantId", "categoryId") REFERENCES "categories"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_tenantId_tagId_fkey" FOREIGN KEY ("tenantId", "tagId") REFERENCES "tags"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundles" ADD CONSTRAINT "bundles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_courses" ADD CONSTRAINT "bundle_courses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_courses" ADD CONSTRAINT "bundle_courses_tenantId_bundleId_fkey" FOREIGN KEY ("tenantId", "bundleId") REFERENCES "bundles"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_courses" ADD CONSTRAINT "bundle_courses_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_instructors" ADD CONSTRAINT "course_instructors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_instructors" ADD CONSTRAINT "course_instructors_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_instructors" ADD CONSTRAINT "course_instructors_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_ratings" ADD CONSTRAINT "course_ratings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_ratings" ADD CONSTRAINT "course_ratings_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_ratings" ADD CONSTRAINT "course_ratings_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_faqs" ADD CONSTRAINT "course_faqs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_faqs" ADD CONSTRAINT "course_faqs_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_requirements" ADD CONSTRAINT "course_requirements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_requirements" ADD CONSTRAINT "course_requirements_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_objectives" ADD CONSTRAINT "course_objectives_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_objectives" ADD CONSTRAINT "course_objectives_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_attachments" ADD CONSTRAINT "lesson_attachments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_attachments" ADD CONSTRAINT "lesson_attachments_tenantId_lessonId_fkey" FOREIGN KEY ("tenantId", "lessonId") REFERENCES "lessons"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_tenantId_lessonId_fkey" FOREIGN KEY ("tenantId", "lessonId") REFERENCES "lessons"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_tenantId_lessonId_fkey" FOREIGN KEY ("tenantId", "lessonId") REFERENCES "lessons"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_tenantId_lessonId_fkey" FOREIGN KEY ("tenantId", "lessonId") REFERENCES "lessons"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitles" ADD CONSTRAINT "subtitles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitles" ADD CONSTRAINT "subtitles_tenantId_videoId_fkey" FOREIGN KEY ("tenantId", "videoId") REFERENCES "videos"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_chapters" ADD CONSTRAINT "video_chapters_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_chapters" ADD CONSTRAINT "video_chapters_tenantId_videoId_fkey" FOREIGN KEY ("tenantId", "videoId") REFERENCES "videos"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_tenantId_videoId_fkey" FOREIGN KEY ("tenantId", "videoId") REFERENCES "videos"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_tenantId_videoId_fkey" FOREIGN KEY ("tenantId", "videoId") REFERENCES "videos"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_tenantId_createdById_fkey" FOREIGN KEY ("tenantId", "createdById") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_tenantId_questionBankId_fkey" FOREIGN KEY ("tenantId", "questionBankId") REFERENCES "question_banks"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_tenantId_createdById_fkey" FOREIGN KEY ("tenantId", "createdById") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "choices" ADD CONSTRAINT "choices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "choices" ADD CONSTRAINT "choices_tenantId_questionId_fkey" FOREIGN KEY ("tenantId", "questionId") REFERENCES "questions"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_tenantId_lessonId_fkey" FOREIGN KEY ("tenantId", "lessonId") REFERENCES "lessons"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_tenantId_questionBankId_fkey" FOREIGN KEY ("tenantId", "questionBankId") REFERENCES "question_banks"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_pools" ADD CONSTRAINT "question_pools_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_pools" ADD CONSTRAINT "question_pools_tenantId_examId_fkey" FOREIGN KEY ("tenantId", "examId") REFERENCES "exams"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_pools" ADD CONSTRAINT "question_pools_tenantId_questionId_fkey" FOREIGN KEY ("tenantId", "questionId") REFERENCES "questions"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_tenantId_examId_fkey" FOREIGN KEY ("tenantId", "examId") REFERENCES "exams"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_tenantId_examAttemptId_fkey" FOREIGN KEY ("tenantId", "examAttemptId") REFERENCES "exam_attempts"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_tenantId_questionId_fkey" FOREIGN KEY ("tenantId", "questionId") REFERENCES "questions"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_tenantId_examId_fkey" FOREIGN KEY ("tenantId", "examId") REFERENCES "exams"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_tenantId_examAttemptId_fkey" FOREIGN KEY ("tenantId", "examAttemptId") REFERENCES "exam_attempts"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_tenantId_lessonId_fkey" FOREIGN KEY ("tenantId", "lessonId") REFERENCES "lessons"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_tenantId_createdById_fkey" FOREIGN KEY ("tenantId", "createdById") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_tenantId_assignmentId_fkey" FOREIGN KEY ("tenantId", "assignmentId") REFERENCES "assignments"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_tenantId_submissionId_fkey" FOREIGN KEY ("tenantId", "submissionId") REFERENCES "submissions"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_tenantId_submissionId_fkey" FOREIGN KEY ("tenantId", "submissionId") REFERENCES "submissions"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_tenantId_studentId_fkey" FOREIGN KEY ("tenantId", "studentId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_tenantId_graderId_fkey" FOREIGN KEY ("tenantId", "graderId") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_tenantId_assignmentId_fkey" FOREIGN KEY ("tenantId", "assignmentId") REFERENCES "assignments"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_tenantId_templateId_fkey" FOREIGN KEY ("tenantId", "templateId") REFERENCES "certificate_templates"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_verifications" ADD CONSTRAINT "certificate_verifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_verifications" ADD CONSTRAINT "certificate_verifications_tenantId_certificateId_fkey" FOREIGN KEY ("tenantId", "certificateId") REFERENCES "certificates"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_tenantId_orderId_fkey" FOREIGN KEY ("tenantId", "orderId") REFERENCES "orders"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_tenantId_bundleId_fkey" FOREIGN KEY ("tenantId", "bundleId") REFERENCES "bundles"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenantId_orderId_fkey" FOREIGN KEY ("tenantId", "orderId") REFERENCES "orders"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_tenantId_couponId_fkey" FOREIGN KEY ("tenantId", "couponId") REFERENCES "coupons"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_tenantId_orderId_fkey" FOREIGN KEY ("tenantId", "orderId") REFERENCES "orders"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_tenantId_purchaserId_fkey" FOREIGN KEY ("tenantId", "purchaserId") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_tenantId_redeemedById_fkey" FOREIGN KEY ("tenantId", "redeemedById") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "courses"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_bundleId_fkey" FOREIGN KEY ("tenantId", "bundleId") REFERENCES "bundles"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_orderId_fkey" FOREIGN KEY ("tenantId", "orderId") REFERENCES "orders"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_subscriptionId_fkey" FOREIGN KEY ("tenantId", "subscriptionId") REFERENCES "subscriptions"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_tenantId_orderId_fkey" FOREIGN KEY ("tenantId", "orderId") REFERENCES "orders"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_tenantId_paymentId_fkey" FOREIGN KEY ("tenantId", "paymentId") REFERENCES "payments"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "users"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
