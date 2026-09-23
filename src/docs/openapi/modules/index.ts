type Schema = Record<string, unknown>;
type Parameter = Record<string, unknown>;
type Responses = Record<string, unknown>;
type Operation = Record<string, unknown>;
type PathItem = Record<string, Operation>;

type Endpoint = {
  method: "get" | "post" | "patch" | "delete";
  path: string;
  tag: string;
  summary: string;
  description: string;
  operationId: string;
  status: 200 | 201 | 204;
  body?: string;
  parameters?: Parameter[];
  auth?: boolean;
  permission?: string;
  paginated?: boolean;
};

const id = (name = "id", description = "Resource identifier"): Parameter => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string", format: "uuid" },
});

const pathString = (name: string, description: string): Parameter => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string", minLength: 1 },
});

const query = (name: string, schema: Schema, description?: string): Parameter => ({
  name,
  in: "query",
  required: false,
  ...(description ? { description } : {}),
  schema,
});

const page = query("page", { type: "integer", minimum: 1, default: 1 });
const limit = query("limit", { type: "integer", minimum: 1, maximum: 100, default: 10 });
const search = query("search", { type: "string", minLength: 1 });
const pagination = [page, limit, search];
const limitOnly = [query("limit", { type: "integer", minimum: 1, maximum: 50, default: 10 })];
const listFilters = [
  ...pagination,
  query("status", { type: "string", minLength: 1 }),
  query("userId", { type: "string", format: "uuid" }),
  query("sortBy", { type: "string", default: "createdAt" }),
  query("sortOrder", { type: "string", enum: ["asc", "desc"], default: "desc" }),
];

const jsonBody = (schema: string): Record<string, unknown> => ({
  required: true,
  content: {
    "application/json": {
      schema: { $ref: `#/components/schemas/${schema}` },
    },
  },
});

const dataResponse = (description: string, paginated = false): Record<string, unknown> => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: paginated ? "#/components/schemas/PaginatedResponse" : "#/components/schemas/SuccessResponse" },
    },
  },
});

const noContent = { description: "No content" };

const commonErrors = (auth = true, permission?: string): Responses => ({
  "400": { $ref: "#/components/responses/ValidationError" },
  ...(auth ? { "401": { $ref: "#/components/responses/Unauthorized" } } : {}),
  ...(permission ? { "403": { $ref: "#/components/responses/Forbidden" } } : {}),
  "404": { $ref: "#/components/responses/NotFound" },
  "409": { $ref: "#/components/responses/Conflict" },
  "422": { $ref: "#/components/responses/UnprocessableEntity" },
  "429": { $ref: "#/components/responses/TooManyRequests" },
  "500": { $ref: "#/components/responses/InternalServerError" },
});

const operation = (endpoint: Endpoint): Operation => {
  const auth = endpoint.auth ?? true;
  const permissionText = endpoint.permission ? ` Requires permission: ${endpoint.permission}.` : "";
  const responses: Responses =
    endpoint.status === 204
      ? { "204": noContent, ...commonErrors(auth, endpoint.permission) }
      : {
          [String(endpoint.status)]: dataResponse(endpoint.status === 201 ? "Created successfully" : "Successful response", endpoint.paginated),
          ...commonErrors(auth, endpoint.permission),
        };

  return {
    tags: [endpoint.tag],
    summary: endpoint.summary,
    description: `${endpoint.description}${auth ? " Requires bearer authentication." : " Public endpoint."}${permissionText}`,
    operationId: endpoint.operationId,
    security: auth ? [{ bearerAuth: [] }] : [],
    ...(endpoint.parameters && endpoint.parameters.length > 0 ? { parameters: endpoint.parameters } : {}),
    ...(endpoint.body ? { requestBody: jsonBody(endpoint.body) } : {}),
    responses,
  };
};

const endpoints: Endpoint[] = [
  { method: "post", path: "/api/auth/register", tag: "Auth", summary: "Register user", description: "Creates a user account using the register validator.", operationId: "authRegister", status: 201, body: "RegisterRequest", auth: false },
  { method: "post", path: "/api/auth/login", tag: "Auth", summary: "Login user", description: "Authenticates email and password and returns access and refresh tokens.", operationId: "authLogin", status: 200, body: "LoginRequest", auth: false },
  { method: "post", path: "/api/auth/refresh", tag: "Auth", summary: "Refresh tokens", description: "Validates a refresh token, rotates the stored token hash, and returns new tokens.", operationId: "authRefresh", status: 200, body: "RefreshTokenRequest", auth: false },
  { method: "post", path: "/api/auth/logout", tag: "Auth", summary: "Logout user", description: "Revokes the submitted refresh token.", operationId: "authLogout", status: 204, body: "RefreshTokenRequest", auth: false },

  { method: "get", path: "/api/users", tag: "Users", summary: "List users", description: "Lists users for the authenticated tenant.", operationId: "usersList", status: 200, parameters: pagination, paginated: true },
  { method: "get", path: "/api/users/{id}", tag: "Users", summary: "Get user", description: "Retrieves one user by id.", operationId: "usersGetById", status: 200, parameters: [id()] },
  { method: "patch", path: "/api/users/{id}", tag: "Users", summary: "Update user", description: "Updates first and last name fields for a user.", operationId: "usersUpdateById", status: 200, parameters: [id()], body: "UpdateUserRequest" },
  { method: "delete", path: "/api/users/{id}", tag: "Users", summary: "Delete user", description: "Soft deletes or removes a user through the users service.", operationId: "usersDeleteById", status: 204, parameters: [id()] },

  { method: "get", path: "/api/profiles/me", tag: "Profiles", summary: "Get my profile", description: "Retrieves the authenticated user's profile.", operationId: "profilesGetMe", status: 200 },
  { method: "patch", path: "/api/profiles/me", tag: "Profiles", summary: "Update my profile", description: "Updates the authenticated user's profile.", operationId: "profilesUpdateMe", status: 200, body: "UpdateProfileRequest" },

  { method: "post", path: "/api/roles", tag: "Roles", summary: "Create role", description: "Creates a tenant role.", operationId: "rolesCreate", status: 201, body: "RoleRequest", permission: "roles:create" },
  { method: "get", path: "/api/roles", tag: "Roles", summary: "List roles", description: "Lists tenant roles.", operationId: "rolesList", status: 200, parameters: pagination, permission: "roles:list", paginated: true },
  { method: "get", path: "/api/roles/{id}", tag: "Roles", summary: "Get role", description: "Retrieves one role by id.", operationId: "rolesGetById", status: 200, parameters: [id()], permission: "roles:read" },
  { method: "patch", path: "/api/roles/{id}", tag: "Roles", summary: "Update role", description: "Updates a role.", operationId: "rolesUpdateById", status: 200, parameters: [id()], body: "RoleUpdateRequest", permission: "roles:update" },
  { method: "delete", path: "/api/roles/{id}", tag: "Roles", summary: "Delete role", description: "Deletes a role.", operationId: "rolesDeleteById", status: 204, parameters: [id()], permission: "roles:delete" },

  { method: "post", path: "/api/permissions", tag: "Permissions", summary: "Create permission", description: "Creates a tenant permission.", operationId: "permissionsCreate", status: 201, body: "PermissionRequest", permission: "permissions:create" },
  { method: "get", path: "/api/permissions", tag: "Permissions", summary: "List permissions", description: "Lists tenant permissions.", operationId: "permissionsList", status: 200, parameters: pagination, permission: "permissions:list", paginated: true },
  { method: "get", path: "/api/permissions/{id}", tag: "Permissions", summary: "Get permission", description: "Retrieves one permission by id.", operationId: "permissionsGetById", status: 200, parameters: [id()], permission: "permissions:read" },
  { method: "patch", path: "/api/permissions/{id}", tag: "Permissions", summary: "Update permission", description: "Updates a permission.", operationId: "permissionsUpdateById", status: 200, parameters: [id()], body: "PermissionUpdateRequest", permission: "permissions:update" },
  { method: "delete", path: "/api/permissions/{id}", tag: "Permissions", summary: "Delete permission", description: "Deletes a permission.", operationId: "permissionsDeleteById", status: 204, parameters: [id()], permission: "permissions:delete" },

  { method: "post", path: "/api/categories", tag: "Categories", summary: "Create category", description: "Creates a course category.", operationId: "categoriesCreate", status: 201, body: "BasicCatalogRequest", permission: "categories:create" },
  { method: "get", path: "/api/categories", tag: "Categories", summary: "List categories", description: "Lists course categories.", operationId: "categoriesList", status: 200, parameters: [page, limit], permission: "categories:list", paginated: true },
  { method: "get", path: "/api/categories/{id}", tag: "Categories", summary: "Get category", description: "Retrieves one category by id.", operationId: "categoriesGetById", status: 200, parameters: [id()], permission: "categories:read" },
  { method: "patch", path: "/api/categories/{id}", tag: "Categories", summary: "Update category", description: "Updates a course category.", operationId: "categoriesUpdateById", status: 200, parameters: [id()], body: "BasicCatalogUpdateRequest", permission: "categories:update" },
  { method: "delete", path: "/api/categories/{id}", tag: "Categories", summary: "Delete category", description: "Deletes a course category.", operationId: "categoriesDeleteById", status: 204, parameters: [id()], permission: "categories:delete" },

  { method: "post", path: "/api/tags", tag: "Tags", summary: "Create tag", description: "Creates a course tag.", operationId: "tagsCreate", status: 201, body: "TagRequest", permission: "tags:create" },
  { method: "get", path: "/api/tags", tag: "Tags", summary: "List tags", description: "Lists course tags.", operationId: "tagsList", status: 200, parameters: [page, limit], permission: "tags:list", paginated: true },
  { method: "get", path: "/api/tags/{id}", tag: "Tags", summary: "Get tag", description: "Retrieves one tag by id.", operationId: "tagsGetById", status: 200, parameters: [id()], permission: "tags:read" },
  { method: "patch", path: "/api/tags/{id}", tag: "Tags", summary: "Update tag", description: "Updates a course tag.", operationId: "tagsUpdateById", status: 200, parameters: [id()], body: "TagUpdateRequest", permission: "tags:update" },
  { method: "delete", path: "/api/tags/{id}", tag: "Tags", summary: "Delete tag", description: "Deletes a course tag.", operationId: "tagsDeleteById", status: 204, parameters: [id()], permission: "tags:delete" },

  { method: "post", path: "/api/courses", tag: "Courses", summary: "Create course", description: "Creates a course.", operationId: "coursesCreate", status: 201, body: "CourseRequest", permission: "courses:create" },
  { method: "get", path: "/api/courses", tag: "Courses", summary: "List courses", description: "Lists courses using controller-level pagination parsing.", operationId: "coursesList", status: 200, parameters: pagination, permission: "courses:list", paginated: true },
  { method: "get", path: "/api/courses/{id}", tag: "Courses", summary: "Get course", description: "Retrieves one course by id.", operationId: "coursesGetById", status: 200, parameters: [id()], permission: "courses:read" },
  { method: "patch", path: "/api/courses/{id}", tag: "Courses", summary: "Update course", description: "Updates a course.", operationId: "coursesUpdateById", status: 200, parameters: [id()], body: "CourseUpdateRequest", permission: "courses:update" },
  { method: "delete", path: "/api/courses/{id}", tag: "Courses", summary: "Delete course", description: "Deletes a course.", operationId: "coursesDeleteById", status: 204, parameters: [id()], permission: "courses:delete" },

  { method: "post", path: "/api/courses/{courseId}/lessons", tag: "Lessons", summary: "Create lesson", description: "Creates a lesson. The body includes the course id validated by the existing lesson schema.", operationId: "lessonsCreate", status: 201, parameters: [id("courseId", "Course identifier")], body: "LessonRequest", permission: "lessons:create" },
  { method: "get", path: "/api/courses/{courseId}/lessons", tag: "Lessons", summary: "List lessons by course", description: "Lists lessons for a course using controller-level pagination parsing.", operationId: "lessonsListByCourse", status: 200, parameters: [id("courseId", "Course identifier"), ...pagination], permission: "lessons:list", paginated: true },
  { method: "get", path: "/api/courses/{courseId}/lessons/{id}", tag: "Lessons", summary: "Get lesson", description: "Retrieves one lesson by id.", operationId: "lessonsGetById", status: 200, parameters: [id("courseId", "Course identifier"), id()], permission: "lessons:read" },
  { method: "patch", path: "/api/courses/{courseId}/lessons/{id}", tag: "Lessons", summary: "Update lesson", description: "Updates a lesson.", operationId: "lessonsUpdateById", status: 200, parameters: [id("courseId", "Course identifier"), id()], body: "LessonUpdateRequest", permission: "lessons:update" },
  { method: "delete", path: "/api/courses/{courseId}/lessons/{id}", tag: "Lessons", summary: "Delete lesson", description: "Deletes a lesson.", operationId: "lessonsDeleteById", status: 204, parameters: [id("courseId", "Course identifier"), id()], permission: "lessons:delete" },

  { method: "post", path: "/api/lesson-attachments", tag: "Lesson Attachments", summary: "Create lesson attachment", description: "Creates a lesson attachment.", operationId: "lessonAttachmentsCreate", status: 201, body: "LessonAttachmentRequest" },
  { method: "get", path: "/api/lesson-attachments", tag: "Lesson Attachments", summary: "List lesson attachments", description: "Lists attachments for the required lessonId query parameter parsed in the controller.", operationId: "lessonAttachmentsListByLesson", status: 200, parameters: [query("lessonId", { type: "string", format: "uuid" }, "Required lesson identifier"), ...pagination], paginated: true },
  { method: "get", path: "/api/lesson-attachments/{id}", tag: "Lesson Attachments", summary: "Get lesson attachment", description: "Retrieves one lesson attachment by id.", operationId: "lessonAttachmentsGetById", status: 200, parameters: [id()] },
  { method: "patch", path: "/api/lesson-attachments/{id}", tag: "Lesson Attachments", summary: "Update lesson attachment", description: "Updates a lesson attachment.", operationId: "lessonAttachmentsUpdateById", status: 200, parameters: [id()], body: "LessonAttachmentUpdateRequest" },
  { method: "delete", path: "/api/lesson-attachments/{id}", tag: "Lesson Attachments", summary: "Delete lesson attachment", description: "Deletes a lesson attachment.", operationId: "lessonAttachmentsDeleteById", status: 204, parameters: [id()] },

  { method: "get", path: "/api/videos", tag: "Videos", summary: "List videos", description: "Lists videos using the video list query validator.", operationId: "videosList", status: 200, parameters: [...pagination, query("lessonId", { type: "string", format: "uuid" }), query("minDurationSeconds", { type: "integer", minimum: 0 }), query("maxDurationSeconds", { type: "integer", minimum: 0 }), query("sortBy", { type: "string", enum: ["createdAt", "updatedAt", "title", "durationSeconds"], default: "createdAt" }), query("sortOrder", { type: "string", enum: ["asc", "desc"], default: "desc" })], permission: "videos:list", paginated: true },
  { method: "post", path: "/api/videos", tag: "Videos", summary: "Create video", description: "Creates a video.", operationId: "videosCreate", status: 201, body: "VideoRequest", permission: "videos:create" },
  { method: "get", path: "/api/videos/statistics", tag: "Videos", summary: "Get video statistics", description: "Retrieves video statistics.", operationId: "videosGetStatistics", status: 200, permission: "videos:read" },
  { method: "get", path: "/api/videos/lessons/{lessonId}", tag: "Videos", summary: "List lesson videos", description: "Lists videos for a lesson.", operationId: "videosListLessonVideos", status: 200, parameters: [id("lessonId", "Lesson identifier")], permission: "videos:list" },
  { method: "get", path: "/api/videos/{id}/previous", tag: "Videos", summary: "Get previous video", description: "Retrieves the previous video relative to a video.", operationId: "videosGetPrevious", status: 200, parameters: [id()], permission: "videos:read" },
  { method: "get", path: "/api/videos/{id}/next", tag: "Videos", summary: "Get next video", description: "Retrieves the next video relative to a video.", operationId: "videosGetNext", status: 200, parameters: [id()], permission: "videos:read" },
  { method: "post", path: "/api/videos/{id}/chapters", tag: "Videos", summary: "Create video chapter", description: "Creates a chapter for a video.", operationId: "videosCreateChapter", status: 201, parameters: [id()], body: "VideoChapterRequest", permission: "videos:update" },
  { method: "get", path: "/api/videos/{id}/chapters", tag: "Videos", summary: "List video chapters", description: "Lists chapters for a video.", operationId: "videosListChapters", status: 200, parameters: [id()], permission: "videos:read" },
  { method: "get", path: "/api/videos/{id}/chapters/{chapterId}", tag: "Videos", summary: "Get video chapter", description: "Retrieves one video chapter.", operationId: "videosGetChapterById", status: 200, parameters: [id(), id("chapterId", "Chapter identifier")], permission: "videos:read" },
  { method: "patch", path: "/api/videos/{id}/chapters/{chapterId}", tag: "Videos", summary: "Update video chapter", description: "Updates one video chapter.", operationId: "videosUpdateChapter", status: 200, parameters: [id(), id("chapterId", "Chapter identifier")], body: "VideoChapterUpdateRequest", permission: "videos:update" },
  { method: "delete", path: "/api/videos/{id}/chapters/{chapterId}", tag: "Videos", summary: "Delete video chapter", description: "Deletes one video chapter.", operationId: "videosDeleteChapter", status: 204, parameters: [id(), id("chapterId", "Chapter identifier")], permission: "videos:update" },
  { method: "post", path: "/api/videos/{id}/subtitles", tag: "Videos", summary: "Create video subtitle", description: "Creates a subtitle for a video.", operationId: "videosCreateSubtitle", status: 201, parameters: [id()], body: "VideoSubtitleRequest", permission: "videos:update" },
  { method: "get", path: "/api/videos/{id}/subtitles", tag: "Videos", summary: "List video subtitles", description: "Lists subtitles for a video.", operationId: "videosListSubtitles", status: 200, parameters: [id()], permission: "videos:read" },
  { method: "get", path: "/api/videos/{id}/subtitles/{subtitleId}", tag: "Videos", summary: "Get video subtitle", description: "Retrieves one video subtitle.", operationId: "videosGetSubtitleById", status: 200, parameters: [id(), id("subtitleId", "Subtitle identifier")], permission: "videos:read" },
  { method: "patch", path: "/api/videos/{id}/subtitles/{subtitleId}", tag: "Videos", summary: "Update video subtitle", description: "Updates one video subtitle.", operationId: "videosUpdateSubtitle", status: 200, parameters: [id(), id("subtitleId", "Subtitle identifier")], body: "VideoSubtitleUpdateRequest", permission: "videos:update" },
  { method: "delete", path: "/api/videos/{id}/subtitles/{subtitleId}", tag: "Videos", summary: "Delete video subtitle", description: "Deletes one video subtitle.", operationId: "videosDeleteSubtitle", status: 204, parameters: [id(), id("subtitleId", "Subtitle identifier")], permission: "videos:update" },
  { method: "get", path: "/api/videos/{id}", tag: "Videos", summary: "Get video", description: "Retrieves one video by id.", operationId: "videosGetById", status: 200, parameters: [id()], permission: "videos:read" },
  { method: "patch", path: "/api/videos/{id}", tag: "Videos", summary: "Update video", description: "Updates a video.", operationId: "videosUpdateById", status: 200, parameters: [id()], body: "VideoUpdateRequest", permission: "videos:update" },
  { method: "delete", path: "/api/videos/{id}", tag: "Videos", summary: "Delete video", description: "Deletes a video.", operationId: "videosDeleteById", status: 204, parameters: [id()], permission: "videos:delete" },

  { method: "get", path: "/api/learning/dashboard", tag: "Student Learning", summary: "Get student dashboard", description: "Retrieves the authenticated learner dashboard.", operationId: "studentLearningGetDashboard", status: 200 },
  { method: "get", path: "/api/learning/continue-watching", tag: "Student Learning", summary: "Get continue watching", description: "Lists lessons to continue watching.", operationId: "studentLearningContinueWatching", status: 200, parameters: limitOnly },
  { method: "get", path: "/api/learning/watch-history/recent", tag: "Student Learning", summary: "Get recent watch history", description: "Lists recently watched lessons.", operationId: "studentLearningRecentWatchHistory", status: 200, parameters: limitOnly },
  { method: "get", path: "/api/learning/notes", tag: "Student Learning", summary: "List my notes", description: "Lists notes for the authenticated user.", operationId: "studentLearningListMyNotes", status: 200, parameters: pagination, paginated: true },
  { method: "patch", path: "/api/learning/notes/{id}", tag: "Student Learning", summary: "Update note", description: "Updates one lesson note.", operationId: "studentLearningUpdateNote", status: 200, parameters: [id()], body: "LessonNoteRequest" },
  { method: "delete", path: "/api/learning/notes/{id}", tag: "Student Learning", summary: "Delete note", description: "Deletes one lesson note.", operationId: "studentLearningDeleteNote", status: 204, parameters: [id()] },
  { method: "get", path: "/api/learning/bookmarks", tag: "Student Learning", summary: "List bookmarks", description: "Lists learner bookmarks.", operationId: "studentLearningListBookmarks", status: 200, parameters: pagination, paginated: true },
  { method: "get", path: "/api/learning/courses/{courseId}/progress", tag: "Student Learning", summary: "Get course progress", description: "Retrieves progress for one course.", operationId: "studentLearningGetCourseProgress", status: 200, parameters: [id("courseId", "Course identifier")] },
  { method: "get", path: "/api/learning/courses/{courseId}/last-watched", tag: "Student Learning", summary: "Get last watched in course", description: "Retrieves the last watched lesson in one course.", operationId: "studentLearningGetLastWatchedInCourse", status: 200, parameters: [id("courseId", "Course identifier")] },
  { method: "post", path: "/api/learning/courses/{courseId}/bookmark", tag: "Student Learning", summary: "Bookmark course", description: "Bookmarks a course for the authenticated user.", operationId: "studentLearningBookmarkCourse", status: 201, parameters: [id("courseId", "Course identifier")] },
  { method: "delete", path: "/api/learning/courses/{courseId}/bookmark", tag: "Student Learning", summary: "Remove course bookmark", description: "Removes a course bookmark.", operationId: "studentLearningRemoveCourseBookmark", status: 204, parameters: [id("courseId", "Course identifier")] },
  { method: "post", path: "/api/learning/lessons/{lessonId}/start", tag: "Student Learning", summary: "Start lesson", description: "Starts lesson progress for the authenticated user.", operationId: "studentLearningStartLesson", status: 200, parameters: [id("lessonId", "Lesson identifier")] },
  { method: "patch", path: "/api/learning/lessons/{lessonId}/progress", tag: "Student Learning", summary: "Update lesson progress", description: "Updates watched seconds and progress percentage.", operationId: "studentLearningUpdateLessonProgress", status: 200, parameters: [id("lessonId", "Lesson identifier")], body: "LessonProgressRequest" },
  { method: "post", path: "/api/learning/lessons/{lessonId}/complete", tag: "Student Learning", summary: "Complete lesson", description: "Marks a lesson as complete.", operationId: "studentLearningCompleteLesson", status: 200, parameters: [id("lessonId", "Lesson identifier")] },
  { method: "post", path: "/api/learning/lessons/{lessonId}/incomplete", tag: "Student Learning", summary: "Mark lesson incomplete", description: "Marks a lesson as incomplete.", operationId: "studentLearningMarkLessonIncomplete", status: 200, parameters: [id("lessonId", "Lesson identifier")] },
  { method: "get", path: "/api/learning/lessons/{lessonId}/progress", tag: "Student Learning", summary: "Get lesson progress", description: "Retrieves progress for one lesson.", operationId: "studentLearningGetLessonProgress", status: 200, parameters: [id("lessonId", "Lesson identifier")] },
  { method: "post", path: "/api/learning/lessons/{lessonId}/notes", tag: "Student Learning", summary: "Create lesson note", description: "Creates a note on one lesson.", operationId: "studentLearningCreateNote", status: 201, parameters: [id("lessonId", "Lesson identifier")], body: "LessonNoteRequest" },
  { method: "get", path: "/api/learning/lessons/{lessonId}/notes", tag: "Student Learning", summary: "List lesson notes", description: "Lists notes for one lesson.", operationId: "studentLearningListLessonNotes", status: 200, parameters: [id("lessonId", "Lesson identifier"), ...pagination], paginated: true },
  { method: "post", path: "/api/learning/lessons/{lessonId}/bookmark", tag: "Student Learning", summary: "Bookmark lesson", description: "Bookmarks a lesson for the authenticated user.", operationId: "studentLearningBookmarkLesson", status: 201, parameters: [id("lessonId", "Lesson identifier")] },
  { method: "delete", path: "/api/learning/lessons/{lessonId}/bookmark", tag: "Student Learning", summary: "Remove lesson bookmark", description: "Removes a lesson bookmark.", operationId: "studentLearningRemoveLessonBookmark", status: 204, parameters: [id("lessonId", "Lesson identifier")] },

  { method: "get", path: "/api/question-bank/questions/statistics", tag: "Question Bank", summary: "Get question statistics", description: "Retrieves question bank statistics.", operationId: "questionBankGetStatistics", status: 200, permission: "question-bank:read" },
  { method: "get", path: "/api/question-bank/questions", tag: "Question Bank", summary: "List questions", description: "Lists questions using the question list validator.", operationId: "questionBankListQuestions", status: 200, parameters: [...pagination, query("type", { type: "string", minLength: 1, maxLength: 50 }), query("questionBankId", { type: "string", format: "uuid" }), query("courseId", { type: "string", format: "uuid" }), query("lessonId", { type: "string", format: "uuid" }), query("examId", { type: "string", format: "uuid" }), query("includeDeleted", { type: "boolean", default: false }), query("sortBy", { type: "string", enum: ["createdAt", "updatedAt", "sortOrder", "points", "type"], default: "createdAt" }), query("sortOrder", { type: "string", enum: ["asc", "desc"], default: "desc" })], permission: "question-bank:list", paginated: true },
  { method: "post", path: "/api/question-bank/questions", tag: "Question Bank", summary: "Create question", description: "Creates a question and optional choices.", operationId: "questionBankCreateQuestion", status: 201, body: "QuestionRequest", permission: "question-bank:create" },
  { method: "get", path: "/api/question-bank/questions/{id}", tag: "Question Bank", summary: "Get question", description: "Retrieves one question by id.", operationId: "questionBankGetQuestionById", status: 200, parameters: [id()], permission: "question-bank:read" },
  { method: "patch", path: "/api/question-bank/questions/{id}", tag: "Question Bank", summary: "Update question", description: "Updates a question.", operationId: "questionBankUpdateQuestion", status: 200, parameters: [id()], body: "QuestionUpdateRequest", permission: "question-bank:update" },
  { method: "delete", path: "/api/question-bank/questions/{id}", tag: "Question Bank", summary: "Delete question", description: "Deletes a question.", operationId: "questionBankDeleteQuestion", status: 204, parameters: [id()], permission: "question-bank:delete" },
  { method: "post", path: "/api/question-bank/questions/{id}/restore", tag: "Question Bank", summary: "Restore question", description: "Restores a deleted question.", operationId: "questionBankRestoreQuestion", status: 200, parameters: [id()], permission: "question-bank:update" },
  { method: "post", path: "/api/question-bank/questions/{id}/choices", tag: "Question Bank", summary: "Create choice", description: "Creates a choice for a question.", operationId: "questionBankCreateChoice", status: 201, parameters: [id()], body: "ChoiceRequest", permission: "question-bank:update" },
  { method: "patch", path: "/api/question-bank/questions/{id}/choices/reorder", tag: "Question Bank", summary: "Reorder choices", description: "Reorders choices for a question.", operationId: "questionBankReorderChoices", status: 200, parameters: [id()], body: "ReorderChoicesRequest", permission: "question-bank:update" },
  { method: "patch", path: "/api/question-bank/questions/{id}/choices/correct", tag: "Question Bank", summary: "Mark correct choice", description: "Sets the correct choice for a question.", operationId: "questionBankMarkCorrectChoice", status: 200, parameters: [id()], body: "MarkCorrectChoiceRequest", permission: "question-bank:update" },
  { method: "patch", path: "/api/question-bank/questions/{id}/choices/{choiceId}", tag: "Question Bank", summary: "Update choice", description: "Updates one question choice.", operationId: "questionBankUpdateChoice", status: 200, parameters: [id(), id("choiceId", "Choice identifier")], body: "ChoiceUpdateRequest", permission: "question-bank:update" },
  { method: "delete", path: "/api/question-bank/questions/{id}/choices/{choiceId}", tag: "Question Bank", summary: "Delete choice", description: "Deletes one question choice.", operationId: "questionBankDeleteChoice", status: 204, parameters: [id(), id("choiceId", "Choice identifier")], permission: "question-bank:update" },
  { method: "get", path: "/api/question-bank/questions/{id}/pools", tag: "Question Bank", summary: "List question pools", description: "Lists pools for one question.", operationId: "questionBankListPools", status: 200, parameters: [id()], permission: "question-bank:read" },
  { method: "post", path: "/api/question-bank/questions/{id}/pools", tag: "Question Bank", summary: "Attach question to pool", description: "Attaches a question to an exam pool.", operationId: "questionBankAttachToPool", status: 201, parameters: [id()], body: "AttachQuestionPoolRequest", permission: "question-bank:update" },
  { method: "delete", path: "/api/question-bank/questions/{id}/pools/{poolId}", tag: "Question Bank", summary: "Remove question from pool", description: "Removes a question from an exam pool.", operationId: "questionBankRemoveFromPool", status: 204, parameters: [id(), id("poolId", "Pool identifier")], permission: "question-bank:update" },

  { method: "get", path: "/api/assessments/statistics", tag: "Assessments", summary: "Get assessment statistics", description: "Retrieves assessment statistics.", operationId: "assessmentsGetStatistics", status: 200, permission: "assessments:read" },
  { method: "get", path: "/api/assessments/exams", tag: "Assessments", summary: "List exams", description: "Lists exams using the exam list validator.", operationId: "assessmentsListExams", status: 200, parameters: [...pagination, query("courseId", { type: "string", format: "uuid" }), query("lessonId", { type: "string", format: "uuid" }), query("questionBankId", { type: "string", format: "uuid" }), query("status", { type: "string", minLength: 1, maxLength: 30 }), query("includeDeleted", { type: "boolean", default: false }), query("sortBy", { type: "string", enum: ["createdAt", "updatedAt", "title", "status", "startsAt", "endsAt"], default: "createdAt" }), query("sortOrder", { type: "string", enum: ["asc", "desc"], default: "desc" })], permission: "assessments:list", paginated: true },
  { method: "post", path: "/api/assessments/exams", tag: "Assessments", summary: "Create exam", description: "Creates an exam.", operationId: "assessmentsCreateExam", status: 201, body: "ExamRequest", permission: "assessments:create" },
  { method: "get", path: "/api/assessments/exams/{id}", tag: "Assessments", summary: "Get exam", description: "Retrieves one exam.", operationId: "assessmentsGetExam", status: 200, parameters: [id()], permission: "assessments:read" },
  { method: "patch", path: "/api/assessments/exams/{id}", tag: "Assessments", summary: "Update exam", description: "Updates an exam.", operationId: "assessmentsUpdateExam", status: 200, parameters: [id()], body: "ExamUpdateRequest", permission: "assessments:update" },
  { method: "delete", path: "/api/assessments/exams/{id}", tag: "Assessments", summary: "Delete exam", description: "Deletes an exam.", operationId: "assessmentsDeleteExam", status: 204, parameters: [id()], permission: "assessments:delete" },
  { method: "post", path: "/api/assessments/exams/{id}/restore", tag: "Assessments", summary: "Restore exam", description: "Restores a deleted exam.", operationId: "assessmentsRestoreExam", status: 200, parameters: [id()], permission: "assessments:update" },
  { method: "get", path: "/api/assessments/exams/{id}/questions", tag: "Assessments", summary: "List exam questions", description: "Lists assigned exam questions.", operationId: "assessmentsListExamQuestions", status: 200, parameters: [id()], permission: "assessments:read" },
  { method: "post", path: "/api/assessments/exams/{id}/questions", tag: "Assessments", summary: "Assign question", description: "Assigns a question to an exam.", operationId: "assessmentsAssignQuestion", status: 201, parameters: [id()], body: "AssignQuestionRequest", permission: "assessments:update" },
  { method: "patch", path: "/api/assessments/exams/{id}/questions/reorder", tag: "Assessments", summary: "Reorder exam questions", description: "Reorders exam questions.", operationId: "assessmentsReorderQuestions", status: 200, parameters: [id()], body: "ReorderExamQuestionsRequest", permission: "assessments:update" },
  { method: "delete", path: "/api/assessments/exams/{id}/questions/{poolId}", tag: "Assessments", summary: "Remove exam question", description: "Removes a question from an exam.", operationId: "assessmentsRemoveQuestion", status: 204, parameters: [id(), id("poolId", "Pool identifier")], permission: "assessments:update" },
  { method: "post", path: "/api/assessments/exams/{id}/attempts", tag: "Assessments", summary: "Start exam attempt", description: "Starts an exam attempt for the authenticated user.", operationId: "assessmentsStartAttempt", status: 201, parameters: [id()] },
  { method: "get", path: "/api/assessments/exams/{id}/attempts/active", tag: "Assessments", summary: "Resume active exam attempt", description: "Retrieves an active exam attempt for the authenticated user.", operationId: "assessmentsResumeAttempt", status: 200, parameters: [id()] },
  { method: "patch", path: "/api/assessments/attempts/{attemptId}/answers", tag: "Assessments", summary: "Save answer", description: "Saves an answer for an active attempt.", operationId: "assessmentsSaveAnswer", status: 200, parameters: [id("attemptId", "Attempt identifier")], body: "SaveAnswerRequest" },
  { method: "delete", path: "/api/assessments/attempts/{attemptId}/answers/{answerId}", tag: "Assessments", summary: "Clear answer", description: "Clears an answer from an attempt.", operationId: "assessmentsClearAnswer", status: 204, parameters: [id("attemptId", "Attempt identifier"), id("answerId", "Answer identifier")] },
  { method: "post", path: "/api/assessments/attempts/{attemptId}/submit", tag: "Assessments", summary: "Submit attempt", description: "Submits an active exam attempt.", operationId: "assessmentsSubmitAttempt", status: 200, parameters: [id("attemptId", "Attempt identifier")] },
  { method: "post", path: "/api/assessments/attempts/{attemptId}/cancel", tag: "Assessments", summary: "Cancel attempt", description: "Cancels an active exam attempt.", operationId: "assessmentsCancelAttempt", status: 200, parameters: [id("attemptId", "Attempt identifier")] },
  { method: "get", path: "/api/assessments/attempts/{attemptId}/result", tag: "Assessments", summary: "Get attempt result", description: "Retrieves an exam attempt result.", operationId: "assessmentsGetResult", status: 200, parameters: [id("attemptId", "Attempt identifier")] },
  { method: "get", path: "/api/assessments/attempts/{attemptId}/review", tag: "Assessments", summary: "Get attempt review", description: "Retrieves exam attempt review data.", operationId: "assessmentsGetReview", status: 200, parameters: [id("attemptId", "Attempt identifier")] },
  { method: "patch", path: "/api/assessments/answers/{answerId}/grade", tag: "Assessments", summary: "Grade answer", description: "Manually grades a student answer.", operationId: "assessmentsGradeAnswer", status: 200, parameters: [id("answerId", "Answer identifier")], body: "ManualGradeAnswerRequest", permission: "assessments:grade" },

  { method: "get", path: "/api/learning-operations/statistics", tag: "Learning Operations", summary: "Get learning operation statistics", description: "Retrieves learning operation statistics.", operationId: "learningOperationsGetStatistics", status: 200, permission: "learning-operations:read" },
  { method: "get", path: "/api/learning-operations/assignments", tag: "Learning Operations", summary: "List assignments", description: "Lists assignments using the assignment list query validator.", operationId: "learningOperationsListAssignments", status: 200, parameters: [...pagination, query("courseId", { type: "string", format: "uuid" }), query("lessonId", { type: "string", format: "uuid" }), query("status", { type: "string", minLength: 1, maxLength: 30 }), query("includeDeleted", { type: "boolean", default: false }), query("sortBy", { type: "string", enum: ["createdAt", "updatedAt", "title", "status", "dueAt"], default: "createdAt" }), query("sortOrder", { type: "string", enum: ["asc", "desc"], default: "desc" })], permission: "assignments:list", paginated: true },
  { method: "post", path: "/api/learning-operations/assignments", tag: "Learning Operations", summary: "Create assignment", description: "Creates an assignment.", operationId: "learningOperationsCreateAssignment", status: 201, body: "AssignmentRequest", permission: "assignments:create" },
  { method: "get", path: "/api/learning-operations/assignments/{id}", tag: "Learning Operations", summary: "Get assignment", description: "Retrieves one assignment.", operationId: "learningOperationsGetAssignment", status: 200, parameters: [id()], permission: "assignments:read" },
  { method: "patch", path: "/api/learning-operations/assignments/{id}", tag: "Learning Operations", summary: "Update assignment", description: "Updates an assignment.", operationId: "learningOperationsUpdateAssignment", status: 200, parameters: [id()], body: "AssignmentUpdateRequest", permission: "assignments:update" },
  { method: "delete", path: "/api/learning-operations/assignments/{id}", tag: "Learning Operations", summary: "Delete assignment", description: "Deletes an assignment.", operationId: "learningOperationsDeleteAssignment", status: 204, parameters: [id()], permission: "assignments:delete" },
  { method: "post", path: "/api/learning-operations/assignments/{id}/restore", tag: "Learning Operations", summary: "Restore assignment", description: "Restores a deleted assignment.", operationId: "learningOperationsRestoreAssignment", status: 200, parameters: [id()], permission: "assignments:update" },
  { method: "post", path: "/api/learning-operations/assignments/{assignmentId}/submissions", tag: "Learning Operations", summary: "Create submission", description: "Creates a submission for an assignment.", operationId: "learningOperationsCreateSubmission", status: 201, parameters: [id("assignmentId", "Assignment identifier")], body: "SubmissionRequest" },
  { method: "get", path: "/api/learning-operations/assignments/{assignmentId}/submissions", tag: "Learning Operations", summary: "List assignment submissions", description: "Lists submissions for an assignment.", operationId: "learningOperationsListAssignmentSubmissions", status: 200, parameters: [id("assignmentId", "Assignment identifier")], permission: "submissions:list" },
  { method: "post", path: "/api/learning-operations/assignments/{assignmentId}/rubrics", tag: "Learning Operations", summary: "Create rubric", description: "Creates a rubric for an assignment.", operationId: "learningOperationsCreateRubric", status: 201, parameters: [id("assignmentId", "Assignment identifier")], body: "RubricRequest", permission: "assignments:update" },
  { method: "get", path: "/api/learning-operations/assignments/{assignmentId}/rubrics", tag: "Learning Operations", summary: "List rubrics", description: "Lists rubrics for an assignment.", operationId: "learningOperationsListRubrics", status: 200, parameters: [id("assignmentId", "Assignment identifier")], permission: "assignments:read" },
  { method: "patch", path: "/api/learning-operations/assignments/{assignmentId}/rubrics/{id}", tag: "Learning Operations", summary: "Update rubric", description: "Updates one rubric.", operationId: "learningOperationsUpdateRubric", status: 200, parameters: [id("assignmentId", "Assignment identifier"), id()], body: "RubricUpdateRequest", permission: "assignments:update" },
  { method: "delete", path: "/api/learning-operations/assignments/{assignmentId}/rubrics/{id}", tag: "Learning Operations", summary: "Delete rubric", description: "Deletes one rubric.", operationId: "learningOperationsDeleteRubric", status: 204, parameters: [id("assignmentId", "Assignment identifier"), id()], permission: "assignments:update" },
  { method: "get", path: "/api/learning-operations/submissions/me", tag: "Learning Operations", summary: "List my submissions", description: "Lists submissions for the authenticated user.", operationId: "learningOperationsListMySubmissions", status: 200 },
  { method: "get", path: "/api/learning-operations/submissions/{id}", tag: "Learning Operations", summary: "Get submission", description: "Retrieves one submission.", operationId: "learningOperationsGetSubmission", status: 200, parameters: [id()] },
  { method: "patch", path: "/api/learning-operations/submissions/{id}", tag: "Learning Operations", summary: "Update submission", description: "Updates a submission.", operationId: "learningOperationsUpdateSubmission", status: 200, parameters: [id()], body: "SubmissionUpdateRequest" },
  { method: "post", path: "/api/learning-operations/submissions/{id}/submit", tag: "Learning Operations", summary: "Submit submission", description: "Submits a submission.", operationId: "learningOperationsSubmitSubmission", status: 200, parameters: [id()] },
  { method: "post", path: "/api/learning-operations/submissions/{id}/grade", tag: "Learning Operations", summary: "Grade submission", description: "Grades a submission.", operationId: "learningOperationsGradeSubmission", status: 200, parameters: [id()], body: "GradeSubmissionRequest", permission: "submissions:grade" },
  { method: "post", path: "/api/learning-operations/certificate-templates", tag: "Learning Operations", summary: "Create certificate template", description: "Creates a certificate template.", operationId: "learningOperationsCreateTemplate", status: 201, body: "CertificateTemplateRequest", permission: "certificates:create" },
  { method: "get", path: "/api/learning-operations/certificate-templates", tag: "Learning Operations", summary: "List certificate templates", description: "Lists certificate templates.", operationId: "learningOperationsListTemplates", status: 200, permission: "certificates:list" },
  { method: "patch", path: "/api/learning-operations/certificate-templates/{id}", tag: "Learning Operations", summary: "Update certificate template", description: "Updates a certificate template.", operationId: "learningOperationsUpdateTemplate", status: 200, parameters: [id()], body: "CertificateTemplateUpdateRequest", permission: "certificates:update" },
  { method: "delete", path: "/api/learning-operations/certificate-templates/{id}", tag: "Learning Operations", summary: "Delete certificate template", description: "Deletes a certificate template.", operationId: "learningOperationsDeleteTemplate", status: 204, parameters: [id()], permission: "certificates:delete" },
  { method: "post", path: "/api/learning-operations/certificates", tag: "Learning Operations", summary: "Generate certificate", description: "Generates a certificate.", operationId: "learningOperationsGenerateCertificate", status: 201, body: "GenerateCertificateRequest", permission: "certificates:create" },
  { method: "get", path: "/api/learning-operations/certificates", tag: "Learning Operations", summary: "List certificates", description: "Lists certificates using certificate list query validation.", operationId: "learningOperationsListCertificates", status: 200, parameters: [page, limit, query("courseId", { type: "string", format: "uuid" }), query("userId", { type: "string", format: "uuid" }), query("templateId", { type: "string", format: "uuid" }), query("includeRevoked", { type: "boolean", default: false })], permission: "certificates:list", paginated: true },
  { method: "get", path: "/api/learning-operations/certificates/{certificateNumber}", tag: "Learning Operations", summary: "Get certificate", description: "Retrieves a certificate by certificate number.", operationId: "learningOperationsGetCertificate", status: 200, parameters: [pathString("certificateNumber", "Certificate number")], permission: "certificates:read" },
  { method: "post", path: "/api/learning-operations/certificates/{id}/revoke", tag: "Learning Operations", summary: "Revoke certificate", description: "Revokes a certificate.", operationId: "learningOperationsRevokeCertificate", status: 200, parameters: [id()], permission: "certificates:update" },
  { method: "get", path: "/api/learning-operations/certificate-verifications/{verificationCode}", tag: "Learning Operations", summary: "Verify certificate", description: "Verifies a certificate by verification code. The route is mounted behind auth middleware in the implementation.", operationId: "learningOperationsVerifyCertificate", status: 200, parameters: [pathString("verificationCode", "Certificate verification code")] },

  { method: "get", path: "/api/commerce/statistics", tag: "Commerce", summary: "Get commerce statistics", description: "Retrieves commerce statistics.", operationId: "commerceGetStatistics", status: 200, permission: "commerce:read" },
  { method: "get", path: "/api/commerce/orders", tag: "Commerce", summary: "List orders", description: "Lists orders.", operationId: "commerceListOrders", status: 200, parameters: listFilters, permission: "orders:list", paginated: true },
  { method: "post", path: "/api/commerce/orders", tag: "Commerce", summary: "Create order", description: "Creates an order for the authenticated user or supplied user id.", operationId: "commerceCreateOrder", status: 201, body: "CreateOrderRequest" },
  { method: "get", path: "/api/commerce/orders/{id}", tag: "Commerce", summary: "Get order", description: "Retrieves one order.", operationId: "commerceGetOrder", status: 200, parameters: [id()], permission: "orders:read" },
  { method: "patch", path: "/api/commerce/orders/{id}", tag: "Commerce", summary: "Update order", description: "Updates one order.", operationId: "commerceUpdateOrder", status: 200, parameters: [id()], body: "UpdateOrderRequest", permission: "orders:update" },
  { method: "delete", path: "/api/commerce/orders/{id}", tag: "Commerce", summary: "Delete order", description: "Deletes one order.", operationId: "commerceDeleteOrder", status: 204, parameters: [id()], permission: "orders:delete" },
  { method: "get", path: "/api/commerce/payments", tag: "Commerce", summary: "List payments", description: "Lists payments.", operationId: "commerceListPayments", status: 200, parameters: listFilters, permission: "payments:list", paginated: true },
  { method: "post", path: "/api/commerce/payments", tag: "Commerce", summary: "Create payment", description: "Creates a payment.", operationId: "commerceCreatePayment", status: 201, body: "PaymentRequest", permission: "payments:create" },
  { method: "patch", path: "/api/commerce/payments/{id}", tag: "Commerce", summary: "Update payment", description: "Updates a payment.", operationId: "commerceUpdatePayment", status: 200, parameters: [id()], body: "PaymentUpdateRequest", permission: "payments:update" },
  { method: "get", path: "/api/commerce/coupons", tag: "Commerce", summary: "List coupons", description: "Lists coupons.", operationId: "commerceListCoupons", status: 200, parameters: listFilters, permission: "coupons:list", paginated: true },
  { method: "post", path: "/api/commerce/coupons", tag: "Commerce", summary: "Create coupon", description: "Creates a coupon.", operationId: "commerceCreateCoupon", status: 201, body: "CouponRequest", permission: "coupons:create" },
  { method: "patch", path: "/api/commerce/coupons/{id}", tag: "Commerce", summary: "Update coupon", description: "Updates a coupon.", operationId: "commerceUpdateCoupon", status: 200, parameters: [id()], body: "CouponUpdateRequest", permission: "coupons:update" },
  { method: "delete", path: "/api/commerce/coupons/{id}", tag: "Commerce", summary: "Delete coupon", description: "Deletes a coupon.", operationId: "commerceDeleteCoupon", status: 204, parameters: [id()], permission: "coupons:delete" },
  { method: "get", path: "/api/commerce/gift-cards", tag: "Commerce", summary: "List gift cards", description: "Lists gift cards.", operationId: "commerceListGiftCards", status: 200, parameters: listFilters, permission: "gift-cards:list", paginated: true },
  { method: "post", path: "/api/commerce/gift-cards", tag: "Commerce", summary: "Create gift card", description: "Creates a gift card.", operationId: "commerceCreateGiftCard", status: 201, body: "GiftCardRequest", permission: "gift-cards:create" },
  { method: "post", path: "/api/commerce/gift-cards/redeem", tag: "Commerce", summary: "Redeem gift card", description: "Redeems a gift card for the authenticated user.", operationId: "commerceRedeemGiftCard", status: 200, body: "RedeemGiftCardRequest" },
  { method: "get", path: "/api/commerce/subscriptions", tag: "Commerce", summary: "List subscriptions", description: "Lists subscriptions.", operationId: "commerceListSubscriptions", status: 200, parameters: listFilters, permission: "subscriptions:list", paginated: true },
  { method: "post", path: "/api/commerce/subscriptions", tag: "Commerce", summary: "Create subscription", description: "Creates a subscription.", operationId: "commerceCreateSubscription", status: 201, body: "SubscriptionRequest", permission: "subscriptions:create" },
  { method: "post", path: "/api/commerce/subscriptions/{id}/cancel", tag: "Commerce", summary: "Cancel subscription", description: "Cancels a subscription.", operationId: "commerceCancelSubscription", status: 200, parameters: [id()], permission: "subscriptions:update" },
  { method: "get", path: "/api/commerce/invoices", tag: "Commerce", summary: "List invoices", description: "Lists invoices.", operationId: "commerceListInvoices", status: 200, parameters: listFilters, permission: "invoices:list", paginated: true },
  { method: "post", path: "/api/commerce/invoices", tag: "Commerce", summary: "Create invoice", description: "Creates an invoice.", operationId: "commerceCreateInvoice", status: 201, body: "InvoiceRequest", permission: "invoices:create" },
  { method: "get", path: "/api/commerce/refunds", tag: "Commerce", summary: "List refunds", description: "Lists refunds.", operationId: "commerceListRefunds", status: 200, parameters: listFilters, permission: "refunds:list", paginated: true },
  { method: "post", path: "/api/commerce/refunds", tag: "Commerce", summary: "Create refund", description: "Creates a refund.", operationId: "commerceCreateRefund", status: 201, body: "RefundRequest", permission: "refunds:create" },
];

function buildPaths(items: Endpoint[]): Record<string, PathItem> {
  return items.reduce<Record<string, PathItem>>((paths, endpoint) => {
    paths[endpoint.path] = {
      ...(paths[endpoint.path] ?? {}),
      [endpoint.method]: operation(endpoint),
    };

    return paths;
  }, {});
}

export const modulePaths = buildPaths(endpoints);
export const documentedEndpointCount = endpoints.length;
