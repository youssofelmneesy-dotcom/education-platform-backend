export const commonSchemas = {
  SuccessResponse: {
    type: "object",
    required: ["success", "message"],
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation completed successfully" },
      data: {
        nullable: true,
        description: "Response payload. Shape depends on the endpoint.",
      },
    },
  },
  ErrorResponse: {
    type: "object",
    required: ["success", "message"],
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed" },
      errors: {
        nullable: true,
        description: "Optional validation or domain error details.",
      },
    },
  },
  ValidationErrorResponse: {
    type: "object",
    required: ["success", "message", "errors"],
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed" },
      errors: {
        type: "object",
        additionalProperties: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
  PaginationMeta: {
    type: "object",
    required: ["total", "page", "limit"],
    properties: {
      total: { type: "integer", minimum: 0 },
      page: { type: "integer", minimum: 1 },
      limit: { type: "integer", minimum: 1 },
    },
  },
  Id: {
    type: "string",
    format: "uuid",
    example: "00000000-0000-0000-0000-000000000000",
  },
  DateTime: {
    type: "string",
    format: "date-time",
    example: "2026-01-01T00:00:00.000Z",
  },
  PaginatedResponse: {
    allOf: [
      { $ref: "#/components/schemas/SuccessResponse" },
      {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
              meta: { $ref: "#/components/schemas/PaginationMeta" },
            },
            additionalProperties: true,
          },
        },
      },
    ],
  },
  EmptyObject: {
    type: "object",
    additionalProperties: false,
  },
  RegisterRequest: {
    type: "object",
    required: ["firstName", "lastName", "email", "password", "confirmPassword"],
    properties: {
      firstName: { type: "string", minLength: 2, maxLength: 50, example: "Yousef" },
      lastName: { type: "string", minLength: 2, maxLength: 50, example: "Elfaidy" },
      email: { type: "string", format: "email", example: "learner@example.com" },
      password: { type: "string", minLength: 8, format: "password", example: "Password1!" },
      confirmPassword: { type: "string", format: "password", example: "Password1!" },
    },
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "learner@example.com" },
      password: { type: "string", minLength: 1, format: "password", example: "Password1!" },
    },
  },
  RefreshTokenRequest: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string", minLength: 1 },
    },
  },
  RegisterResponse: {
    type: "object",
    required: ["id", "firstName", "lastName", "email", "createdAt"],
    properties: {
      id: { $ref: "#/components/schemas/Id" },
      firstName: { type: "string", example: "Yousef" },
      lastName: { type: "string", example: "Elfaidy" },
      email: { type: "string", format: "email", example: "learner@example.com" },
      createdAt: { $ref: "#/components/schemas/DateTime" },
    },
  },
  AuthTokenResponse: {
    type: "object",
    required: ["accessToken", "refreshToken"],
    properties: {
      accessToken: { type: "string" },
      refreshToken: { type: "string" },
      user: { $ref: "#/components/schemas/RegisterResponse" },
    },
  },
  BasicCatalogRequest: {
    type: "object",
    required: ["name", "slug"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100, example: "Programming" },
      slug: { type: "string", minLength: 1, maxLength: 120, example: "programming" },
      description: { type: ["string", "null"], maxLength: 500, example: "Introductory content" },
    },
  },
  BasicCatalogUpdateRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100 },
      slug: { type: "string", minLength: 1, maxLength: 120 },
      description: { type: ["string", "null"], maxLength: 500 },
    },
  },
  TagRequest: {
    type: "object",
    required: ["name", "slug"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100, example: "TypeScript" },
      slug: { type: "string", minLength: 1, maxLength: 120, example: "typescript" },
    },
  },
  TagUpdateRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100 },
      slug: { type: "string", minLength: 1, maxLength: 120 },
    },
  },
  RoleRequest: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100, example: "Instructor" },
      description: { type: ["string", "null"], maxLength: 500 },
    },
  },
  RoleUpdateRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100 },
      description: { type: ["string", "null"], maxLength: 500 },
    },
  },
  PermissionRequest: {
    type: "object",
    required: ["resource", "action"],
    properties: {
      resource: { type: "string", minLength: 1, maxLength: 100, example: "courses" },
      action: { type: "string", minLength: 1, maxLength: 100, example: "create" },
      description: { type: ["string", "null"], maxLength: 500 },
    },
  },
  PermissionUpdateRequest: {
    type: "object",
    properties: {
      resource: { type: "string", minLength: 1, maxLength: 100 },
      action: { type: "string", minLength: 1, maxLength: 100 },
      description: { type: ["string", "null"], maxLength: 500 },
    },
  },
  UpdateUserRequest: {
    type: "object",
    properties: {
      firstName: { type: "string", minLength: 1, maxLength: 50 },
      lastName: { type: "string", minLength: 1, maxLength: 50 },
    },
  },
  UpdateProfileRequest: {
    type: "object",
    properties: {
      phone: { type: ["string", "null"], maxLength: 30 },
      avatarUrl: { type: ["string", "null"], format: "uri", maxLength: 500 },
      bio: { type: ["string", "null"], maxLength: 1000 },
    },
  },
  CourseRequest: {
    type: "object",
    required: ["title", "slug"],
    properties: {
      title: { type: "string", minLength: 1, maxLength: 200, example: "TypeScript Fundamentals" },
      slug: { type: "string", minLength: 1, maxLength: 220, example: "typescript-fundamentals" },
      description: { type: ["string", "null"], maxLength: 5000 },
      shortDescription: { type: ["string", "null"], maxLength: 500 },
      thumbnailUrl: { type: ["string", "null"], maxLength: 500 },
      status: { type: "string", maxLength: 30, default: "draft" },
      language: { type: ["string", "null"], maxLength: 20 },
      durationSeconds: { type: ["integer", "null"], minimum: 0 },
    },
  },
  CourseUpdateRequest: {
    type: "object",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 200 },
      slug: { type: "string", minLength: 1, maxLength: 220 },
      description: { type: ["string", "null"], maxLength: 5000 },
      shortDescription: { type: ["string", "null"], maxLength: 500 },
      thumbnailUrl: { type: ["string", "null"], maxLength: 500 },
      status: { type: "string", maxLength: 30 },
      language: { type: ["string", "null"], maxLength: 20 },
      durationSeconds: { type: ["integer", "null"], minimum: 0 },
    },
  },
  LessonRequest: {
    type: "object",
    required: ["courseId", "title", "slug"],
    properties: {
      courseId: { $ref: "#/components/schemas/Id" },
      title: { type: "string", minLength: 1, maxLength: 200 },
      slug: { type: "string", minLength: 1, maxLength: 220 },
      description: { type: ["string", "null"], maxLength: 5000 },
      content: { type: ["string", "null"], maxLength: 50000 },
      sortOrder: { type: "integer", minimum: 0, default: 0 },
      durationSeconds: { type: ["integer", "null"], minimum: 0 },
      isPreview: { type: "boolean", default: false },
    },
  },
  LessonUpdateRequest: {
    type: "object",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 200 },
      slug: { type: "string", minLength: 1, maxLength: 220 },
      description: { type: ["string", "null"], maxLength: 5000 },
      content: { type: ["string", "null"], maxLength: 50000 },
      sortOrder: { type: "integer", minimum: 0 },
      durationSeconds: { type: ["integer", "null"], minimum: 0 },
      isPreview: { type: "boolean" },
    },
  },
  LessonAttachmentRequest: {
    type: "object",
    required: ["lessonId", "title", "fileUrl"],
    properties: {
      lessonId: { $ref: "#/components/schemas/Id" },
      title: { type: "string", minLength: 1, maxLength: 200 },
      fileUrl: { type: "string", format: "uri" },
      fileType: { type: ["string", "null"], maxLength: 100 },
      fileSize: { type: ["integer", "null"], minimum: 0 },
      sortOrder: { type: "integer", minimum: 0, default: 0 },
    },
  },
  LessonAttachmentUpdateRequest: {
    type: "object",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 200 },
      fileUrl: { type: "string", format: "uri" },
      fileType: { type: ["string", "null"], maxLength: 100 },
      fileSize: { type: ["integer", "null"], minimum: 0 },
      sortOrder: { type: "integer", minimum: 0 },
    },
  },
  VideoRequest: {
    type: "object",
    required: ["lessonId", "sourceUrl"],
    properties: {
      lessonId: { $ref: "#/components/schemas/Id" },
      title: { type: ["string", "null"], maxLength: 200 },
      sourceUrl: { type: "string", format: "uri" },
      thumbnailUrl: { type: ["string", "null"], format: "uri" },
      durationSeconds: { type: ["integer", "null"], minimum: 0 },
    },
  },
  VideoUpdateRequest: {
    type: "object",
    properties: {
      title: { type: ["string", "null"], maxLength: 200 },
      sourceUrl: { type: "string", format: "uri" },
      thumbnailUrl: { type: ["string", "null"], format: "uri" },
      durationSeconds: { type: ["integer", "null"], minimum: 0 },
    },
  },
  VideoChapterRequest: {
    type: "object",
    required: ["title", "startSecond"],
    properties: {
      title: { type: "string", minLength: 1, maxLength: 200 },
      startSecond: { type: "integer", minimum: 0 },
      sortOrder: { type: "integer", minimum: 0 },
    },
  },
  VideoChapterUpdateRequest: {
    type: "object",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 200 },
      startSecond: { type: "integer", minimum: 0 },
      sortOrder: { type: "integer", minimum: 0 },
    },
  },
  VideoSubtitleRequest: {
    type: "object",
    required: ["language", "fileUrl"],
    properties: {
      language: { type: "string", minLength: 1, maxLength: 20 },
      label: { type: ["string", "null"], maxLength: 100 },
      fileUrl: { type: "string", format: "uri" },
      isDefault: { type: "boolean" },
    },
  },
  VideoSubtitleUpdateRequest: {
    type: "object",
    properties: {
      language: { type: "string", minLength: 1, maxLength: 20 },
      label: { type: ["string", "null"], maxLength: 100 },
      fileUrl: { type: "string", format: "uri" },
      isDefault: { type: "boolean" },
    },
  },
  LessonProgressRequest: {
    type: "object",
    required: ["watchedSeconds", "progressPercent"],
    properties: {
      watchedSeconds: { type: "integer", minimum: 0 },
      progressPercent: { type: "integer", minimum: 0, maximum: 100 },
    },
  },
  LessonNoteRequest: {
    type: "object",
    required: ["content"],
    properties: {
      content: { type: "string", minLength: 1, maxLength: 10000 },
    },
  },
  ChoiceRequest: {
    type: "object",
    required: ["content"],
    properties: {
      content: { type: "string", minLength: 1 },
      isCorrect: { type: "boolean" },
      sortOrder: { type: "integer", minimum: 0 },
    },
  },
  ChoiceUpdateRequest: {
    type: "object",
    properties: {
      content: { type: "string", minLength: 1 },
      isCorrect: { type: "boolean" },
      sortOrder: { type: "integer", minimum: 0 },
    },
  },
  QuestionRequest: {
    type: "object",
    required: ["questionBankId", "type", "prompt"],
    properties: {
      questionBankId: { $ref: "#/components/schemas/Id" },
      type: { type: "string", minLength: 1, maxLength: 50 },
      prompt: { type: "string", minLength: 1 },
      explanation: { type: ["string", "null"] },
      points: { type: "integer", minimum: 0 },
      sortOrder: { type: "integer", minimum: 0 },
      choices: { type: "array", items: { $ref: "#/components/schemas/ChoiceRequest" } },
    },
  },
  QuestionUpdateRequest: {
    type: "object",
    properties: {
      questionBankId: { $ref: "#/components/schemas/Id" },
      type: { type: "string", minLength: 1, maxLength: 50 },
      prompt: { type: "string", minLength: 1 },
      explanation: { type: ["string", "null"] },
      points: { type: "integer", minimum: 0 },
      sortOrder: { type: "integer", minimum: 0 },
    },
  },
  ReorderChoicesRequest: {
    type: "object",
    required: ["choices"],
    properties: {
      choices: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["id", "sortOrder"],
          properties: {
            id: { $ref: "#/components/schemas/Id" },
            sortOrder: { type: "integer", minimum: 0 },
          },
        },
      },
    },
  },
  MarkCorrectChoiceRequest: {
    type: "object",
    required: ["choiceId"],
    properties: {
      choiceId: { $ref: "#/components/schemas/Id" },
    },
  },
  AttachQuestionPoolRequest: {
    type: "object",
    required: ["examId"],
    properties: {
      examId: { $ref: "#/components/schemas/Id" },
      points: { type: "integer", minimum: 0 },
      sortOrder: { type: "integer", minimum: 0 },
    },
  },
  ExamRequest: {
    type: "object",
    required: ["courseId", "title"],
    properties: {
      courseId: { $ref: "#/components/schemas/Id" },
      lessonId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      questionBankId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      title: { type: "string", minLength: 1, maxLength: 200 },
      description: { type: ["string", "null"] },
      status: { type: "string", minLength: 1, maxLength: 30 },
      timeLimitMinutes: { type: ["integer", "null"], minimum: 1 },
      passingScore: { type: ["integer", "null"], minimum: 0 },
      maxAttempts: { type: ["integer", "null"], minimum: 1 },
      startsAt: { type: ["string", "null"], format: "date-time" },
      endsAt: { type: ["string", "null"], format: "date-time" },
    },
  },
  ExamUpdateRequest: {
    type: "object",
    properties: {
      courseId: { $ref: "#/components/schemas/Id" },
      lessonId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      questionBankId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      title: { type: "string", minLength: 1, maxLength: 200 },
      description: { type: ["string", "null"] },
      status: { type: "string", minLength: 1, maxLength: 30 },
      timeLimitMinutes: { type: ["integer", "null"], minimum: 1 },
      passingScore: { type: ["integer", "null"], minimum: 0 },
      maxAttempts: { type: ["integer", "null"], minimum: 1 },
      startsAt: { type: ["string", "null"], format: "date-time" },
      endsAt: { type: ["string", "null"], format: "date-time" },
    },
  },
  AssignQuestionRequest: {
    type: "object",
    required: ["questionId"],
    properties: {
      questionId: { $ref: "#/components/schemas/Id" },
      points: { type: "integer", minimum: 0 },
      sortOrder: { type: "integer", minimum: 0 },
    },
  },
  ReorderExamQuestionsRequest: {
    type: "object",
    required: ["questions"],
    properties: {
      questions: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["poolId", "sortOrder"],
          properties: {
            poolId: { $ref: "#/components/schemas/Id" },
            sortOrder: { type: "integer", minimum: 0 },
          },
        },
      },
    },
  },
  SaveAnswerRequest: {
    type: "object",
    required: ["questionId"],
    properties: {
      questionId: { $ref: "#/components/schemas/Id" },
      answerText: { type: ["string", "null"] },
      selectedChoiceIds: { type: "array", items: { $ref: "#/components/schemas/Id" } },
    },
  },
  ManualGradeAnswerRequest: {
    type: "object",
    required: ["pointsAwarded"],
    properties: {
      isCorrect: { type: ["boolean", "null"] },
      pointsAwarded: { type: "integer", minimum: 0 },
    },
  },
  FileRequest: {
    type: "object",
    required: ["fileName", "fileUrl"],
    properties: {
      fileName: { type: "string", minLength: 1, maxLength: 255 },
      fileUrl: { type: "string", format: "uri" },
      fileType: { type: ["string", "null"], maxLength: 100 },
      fileSize: { type: ["integer", "null"], minimum: 0 },
    },
  },
  AssignmentRequest: {
    type: "object",
    required: ["courseId", "title"],
    properties: {
      courseId: { $ref: "#/components/schemas/Id" },
      lessonId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      title: { type: "string", minLength: 1, maxLength: 200 },
      description: { type: ["string", "null"] },
      instructions: { type: ["string", "null"] },
      status: { type: "string", minLength: 1, maxLength: 30 },
      dueAt: { type: ["string", "null"], format: "date-time" },
      maxScore: { type: ["integer", "null"], minimum: 0 },
    },
  },
  AssignmentUpdateRequest: {
    type: "object",
    properties: {
      courseId: { $ref: "#/components/schemas/Id" },
      lessonId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      title: { type: "string", minLength: 1, maxLength: 200 },
      description: { type: ["string", "null"] },
      instructions: { type: ["string", "null"] },
      status: { type: "string", minLength: 1, maxLength: 30 },
      dueAt: { type: ["string", "null"], format: "date-time" },
      maxScore: { type: ["integer", "null"], minimum: 0 },
    },
  },
  SubmissionRequest: {
    type: "object",
    properties: {
      content: { type: ["string", "null"] },
      files: { type: "array", items: { $ref: "#/components/schemas/FileRequest" } },
    },
  },
  SubmissionUpdateRequest: {
    type: "object",
    properties: {
      content: { type: ["string", "null"] },
      status: { type: "string", minLength: 1, maxLength: 30 },
      files: { type: "array", items: { $ref: "#/components/schemas/FileRequest" } },
    },
  },
  GradeSubmissionRequest: {
    type: "object",
    required: ["score", "maxScore"],
    properties: {
      score: { type: "integer", minimum: 0 },
      maxScore: { type: "integer", minimum: 0 },
      feedback: { type: ["string", "null"] },
    },
  },
  RubricRequest: {
    type: "object",
    required: ["title", "maxScore"],
    properties: {
      title: { type: "string", minLength: 1, maxLength: 200 },
      description: { type: ["string", "null"] },
      maxScore: { type: "integer", minimum: 0 },
      sortOrder: { type: "integer", minimum: 0 },
    },
  },
  RubricUpdateRequest: {
    type: "object",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 200 },
      description: { type: ["string", "null"] },
      maxScore: { type: "integer", minimum: 0 },
      sortOrder: { type: "integer", minimum: 0 },
    },
  },
  CertificateTemplateRequest: {
    type: "object",
    required: ["name", "content"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 200 },
      content: { type: "string", minLength: 1 },
      isDefault: { type: "boolean" },
    },
  },
  CertificateTemplateUpdateRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 200 },
      content: { type: "string", minLength: 1 },
      isDefault: { type: "boolean" },
    },
  },
  GenerateCertificateRequest: {
    type: "object",
    required: ["courseId", "userId"],
    properties: {
      courseId: { $ref: "#/components/schemas/Id" },
      userId: { $ref: "#/components/schemas/Id" },
      templateId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      expiresAt: { type: ["string", "null"], format: "date-time" },
    },
  },
  CommerceItemRequest: {
    type: "object",
    required: ["itemType", "title", "unitPrice"],
    properties: {
      courseId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      bundleId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      itemType: { type: "string", minLength: 1, maxLength: 30 },
      title: { type: "string", minLength: 1, maxLength: 200 },
      quantity: { type: "integer", minimum: 1 },
      unitPrice: { type: "integer", minimum: 0 },
    },
  },
  CreateOrderRequest: {
    type: "object",
    required: ["currency", "items"],
    properties: {
      userId: { $ref: "#/components/schemas/Id" },
      currency: { type: "string", minLength: 3, maxLength: 3, example: "USD" },
      tax: { type: "integer", minimum: 0 },
      couponCode: { type: "string" },
      giftCardCode: { type: "string" },
      items: { type: "array", minItems: 1, items: { $ref: "#/components/schemas/CommerceItemRequest" } },
    },
  },
  UpdateOrderRequest: {
    type: "object",
    properties: {
      status: { type: "string", minLength: 1, maxLength: 30 },
      tax: { type: "integer", minimum: 0 },
    },
  },
  PaymentRequest: {
    type: "object",
    required: ["orderId", "provider", "currency", "amount"],
    properties: {
      orderId: { $ref: "#/components/schemas/Id" },
      provider: { type: "string", minLength: 1, maxLength: 50 },
      providerTransactionId: { type: ["string", "null"], maxLength: 255 },
      status: { type: "string", maxLength: 30 },
      currency: { type: "string", minLength: 3, maxLength: 3 },
      amount: { type: "integer", minimum: 0 },
      paidAt: { type: ["string", "null"], format: "date-time" },
    },
  },
  PaymentUpdateRequest: {
    type: "object",
    properties: {
      status: { type: "string", maxLength: 30 },
      providerTransactionId: { type: ["string", "null"], maxLength: 255 },
      paidAt: { type: ["string", "null"], format: "date-time" },
    },
  },
  CouponRequest: {
    type: "object",
    required: ["code", "discountType", "discountValue"],
    properties: {
      code: { type: "string", minLength: 1, maxLength: 100 },
      description: { type: ["string", "null"] },
      discountType: { type: "string", minLength: 1, maxLength: 30 },
      discountValue: { type: "integer", minimum: 0 },
      maxRedemptions: { type: ["integer", "null"], minimum: 1 },
      perUserLimit: { type: ["integer", "null"], minimum: 1 },
      startsAt: { type: ["string", "null"], format: "date-time" },
      expiresAt: { type: ["string", "null"], format: "date-time" },
      isActive: { type: "boolean" },
    },
  },
  CouponUpdateRequest: {
    type: "object",
    properties: {
      code: { type: "string", minLength: 1, maxLength: 100 },
      description: { type: ["string", "null"] },
      discountType: { type: "string", minLength: 1, maxLength: 30 },
      discountValue: { type: "integer", minimum: 0 },
      maxRedemptions: { type: ["integer", "null"], minimum: 1 },
      perUserLimit: { type: ["integer", "null"], minimum: 1 },
      startsAt: { type: ["string", "null"], format: "date-time" },
      expiresAt: { type: ["string", "null"], format: "date-time" },
      isActive: { type: "boolean" },
    },
  },
  GiftCardRequest: {
    type: "object",
    required: ["code", "currency", "initialBalance"],
    properties: {
      code: { type: "string", minLength: 1 },
      purchaserId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      currency: { type: "string", minLength: 3, maxLength: 3 },
      initialBalance: { type: "integer", minimum: 0 },
      expiresAt: { type: ["string", "null"], format: "date-time" },
    },
  },
  RedeemGiftCardRequest: {
    type: "object",
    required: ["code"],
    properties: {
      code: { type: "string", minLength: 1 },
      amount: { type: "integer", minimum: 1 },
    },
  },
  SubscriptionRequest: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { $ref: "#/components/schemas/Id" },
      courseId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      bundleId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      provider: { type: ["string", "null"], maxLength: 50 },
      providerSubscriptionId: { type: ["string", "null"], maxLength: 255 },
      status: { type: "string", maxLength: 30 },
      startsAt: { type: "string", format: "date-time" },
      currentPeriodStart: { type: ["string", "null"], format: "date-time" },
      currentPeriodEnd: { type: ["string", "null"], format: "date-time" },
    },
  },
  InvoiceRequest: {
    type: "object",
    required: ["userId", "currency", "subtotal", "total"],
    properties: {
      userId: { $ref: "#/components/schemas/Id" },
      orderId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      subscriptionId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      status: { type: "string", maxLength: 30 },
      currency: { type: "string", minLength: 3, maxLength: 3 },
      subtotal: { type: "integer", minimum: 0 },
      tax: { type: "integer", minimum: 0 },
      total: { type: "integer", minimum: 0 },
      dueAt: { type: ["string", "null"], format: "date-time" },
      paidAt: { type: ["string", "null"], format: "date-time" },
    },
  },
  RefundRequest: {
    type: "object",
    required: ["orderId", "currency", "amount"],
    properties: {
      orderId: { $ref: "#/components/schemas/Id" },
      paymentId: { anyOf: [{ $ref: "#/components/schemas/Id" }, { type: "null" }] },
      providerRefundId: { type: ["string", "null"], maxLength: 255 },
      status: { type: "string", maxLength: 30 },
      reason: { type: ["string", "null"] },
      currency: { type: "string", minLength: 3, maxLength: 3 },
      amount: { type: "integer", minimum: 0 },
      refundedAt: { type: ["string", "null"], format: "date-time" },
    },
  },
} as const;
