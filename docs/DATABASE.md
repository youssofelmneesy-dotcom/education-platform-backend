# Database

## Database Technology

The application uses PostgreSQL with Prisma as the ORM. Prisma Client is generated from `prisma/schema.prisma` and imported through `src/database/prisma.ts`.

The Prisma schema validates successfully with:

```bash
npx prisma validate
```

## Prisma Usage

Repositories are the only intended application layer for Prisma queries. Services call repositories instead of importing Prisma directly. This keeps business behavior separate from query implementation details.

The Prisma client uses development query logging when `NODE_ENV` is `development`; otherwise it logs errors.

## Main Entities

The schema contains these implemented model groups:

Core identity and tenancy:

- `Tenant`
- `User`
- `Profile`
- `Role`
- `Permission`
- `UserRole`
- `RolePermission`

Authentication:

- `RefreshToken`
- `OTP`
- `UserSession`
- `TrustedDevice`
- `LoginHistory`

Education:

- `Category`
- `Tag`
- `Course`
- `CourseCategory`
- `CourseTag`
- `Bundle`
- `BundleCourse`
- `CourseInstructor`
- `CourseReview`
- `CourseRating`
- `CourseFAQ`
- `CourseRequirement`
- `CourseObjective`
- `Lesson`
- `LessonAttachment`
- `Bookmark`
- `LessonNote`
- `Video`
- `Subtitle`
- `VideoChapter`
- `WatchProgress`
- `WatchHistory`

Assessment and learning operations:

- `QuestionBank`
- `Question`
- `Choice`
- `Exam`
- `QuestionPool`
- `ExamAttempt`
- `StudentAnswer`
- `ExamResult`
- `Assignment`
- `Submission`
- `SubmissionFile`
- `Grade`
- `Rubric`
- `Certificate`
- `CertificateTemplate`
- `CertificateVerification`

Commerce:

- `Order`
- `OrderItem`
- `Payment`
- `Coupon`
- `CouponUsage`
- `GiftCard`
- `Subscription`
- `Invoice`
- `Refund`

## Relationships

The schema models relationships explicitly with Prisma `@relation` fields and PostgreSQL foreign keys.

Most business models relate to `Tenant`. User-owned data relates to `User` through tenant-aware references. Course content relates through `Course`, `Lesson`, and `Video`. Assessment and learning operation records connect to courses, lessons, users, attempts, submissions, and certificates. Commerce records connect orders, payments, coupons, subscriptions, invoices, refunds, users, courses, and bundles.

Many relationships use composite references such as `[tenantId, id]` to preserve tenant-aware access patterns.

## Tenant-Aware Design

Business tables include `tenantId` and define tenant-scoped unique constraints and indexes. Examples include unique email per tenant, unique role name per tenant, unique permission resource/action per tenant, unique course slug per tenant, and tenant-scoped commerce identifiers.

This design supports data isolation at the database relationship and query level. Application repositories also include tenant filters when reading authorization context and domain records.

## Soft Delete Strategy

Most persisted business models include:

- `createdAt`
- `updatedAt`
- `deletedAt`

`deletedAt` is nullable and represents soft deletion. Queries that need active records filter `deletedAt: null`. Many tables include indexes on `deletedAt` and `[tenantId, deletedAt]` to support active-record lookups.

## Indexes

The schema defines indexes for common access patterns:

- Tenant filtering.
- Soft-delete filtering.
- User-owned records.
- Course, lesson, video, assignment, exam, and commerce lookups.
- Status fields.
- Time-based fields such as `createdAt`, `publishedAt`, `expiresAt`, `submittedAt`, `paidAt`, and `refundedAt`.
- Join table traversal.

Indexes are defined in Prisma with `@@index`.

## Constraints

The schema uses:

- UUID primary keys.
- Tenant-scoped unique constraints.
- Join table uniqueness to prevent duplicate relationships.
- Global unique values only where the implementation requires them, such as token hashes or verification codes.
- Foreign-key actions such as `Cascade`, `Restrict`, and `Cascade` updates according to relationship behavior.

## Migration Strategy

Migration files are stored in `prisma/migrations`.

Available package scripts:

```bash
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:reset
```

Use `prisma migrate dev` for local migration development and `prisma migrate deploy` for applying committed migrations in controlled environments.

No seed script or seed file currently exists.
