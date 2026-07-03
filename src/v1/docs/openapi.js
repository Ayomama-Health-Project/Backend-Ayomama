function successResponseSchema(dataSchema, messageExample) {
  return {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: messageExample || "Request completed successfully.",
      },
      data: dataSchema || { type: "object" },
    },
  };
}

function problemResponse(description = "Bad Request") {
  return {
    description,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ProblemDetail" },
      },
    },
  };
}

function successResponse(description, dataSchema, messageExample) {
  return {
    description,
    content: {
      "application/json": {
        schema: successResponseSchema(dataSchema, messageExample),
      },
    },
  };
}

export function buildOpenApiSpec() {
  return {
    openapi: "3.0.3",
    info: {
      title: "AYOMAMA API",
      version: "1.0.0",
      description:
        "Detailed API documentation for AYOMAMA authentication, onboarding, profile management, partner invites, notification token storage, and admin account management.",
    },
    servers: [{ url: "/api/v1", description: "Local API v1 base path" }],
    tags: [
      {
        name: "Auth",
        description: "Registration, login, refresh, logout, password reset, and current-user endpoints.",
      },
      {
        name: "Me",
        description: "Authenticated account profile, onboarding progress, language, and notification token endpoints.",
      },
      {
        name: "Partner Invites",
        description: "Endpoints for mothers to generate partner invite links and for partners to inspect invites.",
      },
      {
        name: "Admin",
        description: "Admin and super admin authentication and admin-account management endpoints.",
      },
      {
        name: "Dashboard",
        description: "Dashboard summary, development context, and checklist endpoints.",
      },
      {
        name: "Visits",
        description: "Appointment and visit reminder endpoints for mothers and linked partners.",
      },
      {
        name: "Emergency",
        description: "Nearby hospital lookup using device coordinates.",
      },
      {
        name: "Chat",
        description: "AYOMAMA smart chat history, streaming response, and clear-chat endpoints.",
      },
      {
        name: "Blogs",
        description: "Published blog reading endpoints for mobile plus admin blog management endpoints.",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorItem: {
          type: "object",
          properties: {
            field: { type: "string", example: "email" },
            code: { type: "string", example: "invalid_string" },
            message: { type: "string", example: "Invalid email address." },
          },
        },
        ProblemDetail: {
          type: "object",
          properties: {
            type: {
              type: "string",
              example: "https://veridom.com/problems/validation-error",
            },
            title: { type: "string", example: "Validation failed" },
            status: { type: "integer", example: 422 },
            detail: { type: "string", example: "price must be >= 0" },
            instance: {
              type: "string",
              example: "/api/v1/auth/register/mother",
            },
            errors: {
              type: "array",
              items: { $ref: "#/components/schemas/ErrorItem" },
            },
          },
        },
        EmergencyContact: {
          type: "object",
          properties: {
            name: { type: "string", example: "Ada Obi" },
            phoneNumber: { type: "string", example: "+2348012345678" },
            relationship: { type: "string", example: "Sister" },
          },
        },
        NotificationToken: {
          type: "object",
          properties: {
            id: { type: "string", example: "67f0ab2f7c8bd3a5f8f64511" },
            platform: {
              type: "string",
              enum: ["ios", "android", "web"],
              example: "android",
            },
            expoPushToken: {
              type: "string",
              example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
            },
            deviceId: { type: "string", example: "android-partner" },
            enabled: { type: "boolean", example: true },
          },
        },
        NotificationsState: {
          type: "object",
          properties: {
            enabled: { type: "boolean", example: true },
            tokens: {
              type: "array",
              items: { $ref: "#/components/schemas/NotificationToken" },
            },
          },
        },
        OnboardingProgress: {
          type: "object",
          properties: {
            flow: {
              type: "string",
              example: "mother_pregnant_onboarding",
            },
            currentStep: {
              type: "integer",
              minimum: 0,
              example: 4,
            },
            draft: {
              type: "object",
              additionalProperties: true,
              example: {
                fullName: "Amara Okafor",
                selectedLanguage: "en",
                supportSelection: "partner",
              },
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-28T10:12:00.000Z",
            },
          },
        },
        MotherProfile: {
          type: "object",
          properties: {
            fullName: { type: "string", example: "Amara Okafor" },
            phoneNumber: { type: "string", example: "+2348012345678" },
            address: { type: "string", example: "Lekki, Lagos" },
            emergencyContacts: {
              type: "array",
              items: { $ref: "#/components/schemas/EmergencyContact" },
            },
            dueDate: { type: "string", format: "date-time", nullable: true },
            lastPeriodDate: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            pregnancyWeek: {
              type: "integer",
              minimum: 0,
              maximum: 45,
              nullable: true,
            },
            antenatalProvider: { type: "string", example: "Yes" },
            babyName: { type: "string", example: "Baby Okafor" },
            babyNickname: { type: "string", example: "Sunshine" },
            babyBirthDate: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            babyBirthWeight: { type: "string", example: "3.2kg" },
            babyBirthHospital: { type: "string", example: "General Hospital Ikeja" },
            healthConcerns: { type: "string", example: "Fatigue, dizziness" },
            supportCircle: {
              type: "array",
              items: { type: "string" },
              example: ["partner"],
            },
            quickSetupSelections: {
              type: "array",
              items: { type: "string" },
              example: ["health", "tips", "community"],
            },
          },
        },
        PartnerProfile: {
          type: "object",
          properties: {
            fullName: { type: "string", example: "Tobi Okafor" },
            phoneNumber: { type: "string", example: "+2348098765432" },
            relationshipLabel: { type: "string", example: "Partner" },
            linkedMotherAccount: {
              type: "string",
              nullable: true,
              example: "67f0ab2f7c8bd3a5f8f64111",
            },
            inviteAcceptedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },
        HealthWorkerProfile: {
          type: "object",
          properties: {
            fullName: { type: "string", example: "Nurse Chidinma" },
            phoneNumber: { type: "string", example: "+2348034567890" },
            state: { type: "string", example: "Lagos" },
            localGovernment: { type: "string", example: "Eti-Osa" },
            occupation: { type: "string", example: "Midwife" },
            facilityName: { type: "string", example: "Ayomama Clinic" },
            facilityCode: { type: "string", example: "AYO-102" },
          },
        },
        AdminProfile: {
          type: "object",
          properties: {
            fullName: { type: "string", example: "System Admin" },
            permissions: {
              type: "array",
              items: { type: "string" },
              example: ["accounts.manage", "admins.manage"],
            },
          },
        },
        AccountResponse: {
          type: "object",
          properties: {
            id: { type: "string", example: "67f0ab2f7c8bd3a5f8f64001" },
            email: { type: "string", format: "email", example: "mother@ayomama.app" },
            role: {
              type: "string",
              enum: ["mother", "partner", "health_worker", "admin", "super_admin"],
              example: "mother",
            },
            status: {
              type: "string",
              enum: ["pending_onboarding", "active", "suspended"],
              example: "pending_onboarding",
            },
            isEmailVerified: { type: "boolean", example: false },
            language: {
              type: "string",
              enum: ["en", "yo", "ha", "ig"],
              example: "en",
            },
            profilePicture: {
              type: "string",
              nullable: true,
              example: "https://res.cloudinary.com/demo/image/upload/user.png",
            },
            onboardingCompleted: { type: "boolean", example: false },
            onboardingProgress: {
              $ref: "#/components/schemas/OnboardingProgress",
            },
            motherType: {
              type: "string",
              enum: ["pregnant", "postpartum"],
              nullable: true,
            },
            healthWorkerType: {
              type: "string",
              enum: ["with_clinic", "without_clinic"],
              nullable: true,
            },
            profile: {
              oneOf: [
                { $ref: "#/components/schemas/MotherProfile" },
                { $ref: "#/components/schemas/PartnerProfile" },
                { $ref: "#/components/schemas/HealthWorkerProfile" },
                { $ref: "#/components/schemas/AdminProfile" },
              ],
            },
            notifications: {
              $ref: "#/components/schemas/NotificationsState",
            },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: { type: "string", example: "eyJhbGciOi..." },
            refreshToken: { type: "string", example: "eyJhbGciOi..." },
          },
        },
        AuthSessionResponse: {
          type: "object",
          properties: {
            tokens: { $ref: "#/components/schemas/AuthTokens" },
            account: { $ref: "#/components/schemas/AccountResponse" },
          },
        },
        RegisterMotherInput: {
          type: "object",
          required: ["email", "password", "motherType"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            motherType: {
              type: "string",
              enum: ["pregnant", "postpartum"],
            },
            language: { type: "string", enum: ["en", "yo", "ha", "ig"] },
            fullName: { type: "string" },
            phoneNumber: { type: "string" },
            address: { type: "string" },
            dueDate: { type: "string", format: "date-time" },
            lastPeriodDate: { type: "string", format: "date-time" },
            pregnancyWeek: { type: "integer", minimum: 0, maximum: 45 },
            emergencyContacts: {
              type: "array",
              items: { $ref: "#/components/schemas/EmergencyContact" },
            },
          },
        },
        RegisterPartnerInput: {
          type: "object",
          required: ["email", "password", "inviteToken"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            fullName: { type: "string" },
            phoneNumber: { type: "string" },
            relationshipLabel: { type: "string" },
            inviteToken: { type: "string", example: "1d19cb51db..." },
            language: { type: "string", enum: ["en", "yo", "ha", "ig"] },
          },
        },
        RegisterHealthWorkerInput: {
          type: "object",
          required: ["email", "password", "healthWorkerType"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            healthWorkerType: {
              type: "string",
              enum: ["with_clinic", "without_clinic"],
            },
            fullName: { type: "string" },
            phoneNumber: { type: "string" },
            state: { type: "string" },
            localGovernment: { type: "string" },
            occupation: { type: "string" },
            facilityName: { type: "string" },
            facilityCode: { type: "string" },
            language: { type: "string", enum: ["en", "yo", "ha", "ig"] },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
          },
        },
        RefreshInput: {
          type: "object",
          properties: {
            refreshToken: { type: "string" },
          },
        },
        ForgotPasswordInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        VerifyOtpInput: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", format: "email" },
            otp: { type: "string", minLength: 4, maxLength: 4 },
          },
        },
        ResetPasswordInput: {
          type: "object",
          required: ["email", "otp", "newPassword"],
          properties: {
            email: { type: "string", format: "email" },
            otp: { type: "string", minLength: 4, maxLength: 4 },
            newPassword: { type: "string", minLength: 6 },
          },
        },
        PatchProfileInput: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            phoneNumber: { type: "string" },
            address: { type: "string" },
            profilePicture: { type: "string", format: "uri" },
            state: { type: "string" },
            localGovernment: { type: "string" },
            occupation: { type: "string" },
            facilityName: { type: "string" },
            facilityCode: { type: "string" },
            relationshipLabel: { type: "string" },
            dueDate: { type: "string", format: "date-time" },
            lastPeriodDate: { type: "string", format: "date-time" },
            pregnancyWeek: { type: "integer", minimum: 0, maximum: 45 },
            babyName: { type: "string" },
            babyNickname: { type: "string" },
            babyBirthDate: { type: "string", format: "date-time" },
            babyBirthWeight: { type: "string" },
            babyBirthHospital: { type: "string" },
            healthConcerns: { type: "string" },
            emergencyContacts: {
              type: "array",
              items: { $ref: "#/components/schemas/EmergencyContact" },
            },
          },
        },
        PatchLanguageInput: {
          type: "object",
          required: ["language"],
          properties: {
            language: {
              type: "string",
              enum: ["en", "yo", "ha", "ig"],
            },
          },
        },
        PatchOnboardingInput: {
          type: "object",
          required: ["onboardingCompleted"],
          properties: {
            onboardingCompleted: { type: "boolean" },
            currentStep: { type: "integer", minimum: 0 },
            flow: { type: "string", example: "mother_pregnant_onboarding" },
            draft: {
              type: "object",
              additionalProperties: true,
            },
            quickSetupSelections: {
              type: "array",
              items: { type: "string" },
            },
            supportCircle: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        NotificationTokenInput: {
          type: "object",
          required: ["platform", "expoPushToken"],
          properties: {
            platform: {
              type: "string",
              enum: ["ios", "android", "web"],
            },
            expoPushToken: { type: "string" },
            deviceId: { type: "string" },
            enabled: { type: "boolean", default: true },
          },
        },
        InviteInput: {
          type: "object",
          properties: {
            invitedEmail: {
              type: "string",
              format: "email",
              example: "partner@ayomama.app",
            },
          },
        },
        PartnerInviteResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            token: { type: "string" },
            inviteUrl: { type: "string", format: "uri" },
            expiresAt: { type: "string", format: "date-time" },
            invitedEmail: { type: "string", format: "email" },
          },
        },
        PartnerInviteInspectResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            inviteUrl: { type: "string", format: "uri" },
            invitedEmail: { type: "string", format: "email" },
            expiresAt: { type: "string", format: "date-time" },
            inviter: {
              type: "object",
              properties: {
                _id: { type: "string" },
                email: { type: "string", format: "email" },
                role: { type: "string", example: "mother" },
              },
            },
          },
        },
        CreateAdminInput: {
          type: "object",
          required: ["email", "password", "fullName"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            fullName: { type: "string", minLength: 1 },
            adminRole: {
              type: "string",
              enum: ["admin", "super_admin"],
              default: "admin",
            },
            permissions: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
    paths: {
      "/auth/register/mother": {
        post: {
          tags: ["Auth"],
          summary: "Create a mother account",
          description:
            "Register a pregnant or postpartum mother account, create the linked mother profile, and immediately return an authenticated session.",
          operationId: "auth_register_mother",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterMotherInput" },
              },
            },
          },
          responses: {
            201: successResponse(
              "Mother account created successfully.",
              { $ref: "#/components/schemas/AuthSessionResponse" },
              "Mother account created successfully.",
            ),
            422: problemResponse("Validation failed."),
          },
        },
      },
      "/auth/register/partner": {
        post: {
          tags: ["Auth"],
          summary: "Create a partner account with invite token",
          description:
            "Register a partner or family-support account, validate the invite token, link the new account to the inviting mother, and return an authenticated session.",
          operationId: "auth_register_partner",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterPartnerInput" },
              },
            },
          },
          responses: {
            201: successResponse(
              "Partner account created successfully.",
              { $ref: "#/components/schemas/AuthSessionResponse" },
              "Partner account created successfully.",
            ),
            404: problemResponse("Invite token is invalid or expired."),
            422: problemResponse("Validation failed."),
          },
        },
      },
      "/auth/register/health-worker": {
        post: {
          tags: ["Auth"],
          summary: "Create a health worker account",
          description:
            "Register a health worker account with either the with-clinic or without-clinic subtype and return an authenticated session.",
          operationId: "auth_register_health_worker",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterHealthWorkerInput" },
              },
            },
          },
          responses: {
            201: successResponse(
              "Health worker account created successfully.",
              { $ref: "#/components/schemas/AuthSessionResponse" },
              "Health worker account created successfully.",
            ),
            422: problemResponse("Validation failed."),
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login for any supported role",
          description:
            "Authenticate a mother, partner, health worker, admin, or super admin and return both access and refresh tokens.",
          operationId: "auth_login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginInput" },
              },
            },
          },
          responses: {
            200: successResponse(
              "Login successful.",
              { $ref: "#/components/schemas/AuthSessionResponse" },
              "Login successful.",
            ),
            401: problemResponse("Invalid credentials."),
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh session tokens",
          description:
            "Rotate the refresh token and issue a fresh authenticated session response.",
          operationId: "auth_refresh",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RefreshInput" },
              },
            },
          },
          responses: {
            200: successResponse(
              "Session refreshed successfully.",
              { $ref: "#/components/schemas/AuthSessionResponse" },
              "Session refreshed.",
            ),
            401: problemResponse("Refresh token invalid."),
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout current session",
          description:
            "Invalidate the provided refresh token and clear the backend session cookie if one is present.",
          operationId: "auth_logout",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RefreshInput" },
              },
            },
          },
          responses: {
            200: successResponse("Logout successful.", { nullable: true }, "Logout successful."),
          },
        },
      },
      "/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Send reset OTP via Brevo",
          description:
            "Send a four-digit password reset OTP to the provided email address using Brevo transactional email.",
          operationId: "auth_forgot_password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ForgotPasswordInput" },
              },
            },
          },
          responses: {
            200: successResponse("Password reset OTP sent.", { nullable: true }, "Password reset OTP sent."),
            404: problemResponse("Account not found."),
          },
        },
      },
      "/auth/verify-reset-otp": {
        post: {
          tags: ["Auth"],
          summary: "Verify password reset OTP",
          description:
            "Validate the OTP before allowing the final password reset step.",
          operationId: "auth_verify_reset_otp",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyOtpInput" },
              },
            },
          },
          responses: {
            200: successResponse("OTP verified successfully.", { nullable: true }, "OTP verified successfully."),
            400: problemResponse("OTP is invalid or expired."),
          },
        },
      },
      "/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Reset password with OTP",
          description:
            "Complete a password reset using the verified OTP and the new password.",
          operationId: "auth_reset_password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResetPasswordInput" },
              },
            },
          },
          responses: {
            200: successResponse("Password reset successfully.", { nullable: true }, "Password reset successfully."),
            400: problemResponse("OTP is invalid or expired."),
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Fetch current authenticated account",
          description:
            "Return the current authenticated account, full linked profile, onboarding progress, and notification state.",
          operationId: "auth_me",
          security: [{ bearerAuth: [] }],
          responses: {
            200: successResponse(
              "Current account fetched successfully.",
              { $ref: "#/components/schemas/AccountResponse" },
              "Current account fetched successfully.",
            ),
            401: problemResponse("Unauthorized."),
          },
        },
      },
      "/me/profile": {
        patch: {
          tags: ["Me"],
          summary: "Update current account profile",
          description:
            "Update the authenticated user's role-specific profile fields such as full name, location, facility details, emergency contacts, or pregnancy/postpartum details.",
          operationId: "me_patch_profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatchProfileInput" },
              },
            },
          },
          responses: {
            200: successResponse(
              "Profile updated successfully.",
              { $ref: "#/components/schemas/AccountResponse" },
              "Profile updated successfully.",
            ),
            403: problemResponse("Forbidden."),
            422: problemResponse("Validation failed."),
          },
        },
      },
      "/me/language": {
        patch: {
          tags: ["Me"],
          summary: "Update current account language",
          description: "Save the authenticated user's preferred language.",
          operationId: "me_patch_language",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatchLanguageInput" },
              },
            },
          },
          responses: {
            200: successResponse(
              "Language updated successfully.",
              { $ref: "#/components/schemas/AccountResponse" },
              "Language updated successfully.",
            ),
            422: problemResponse("Validation failed."),
          },
        },
      },
      "/me/mother-type": {
        patch: {
          tags: ["Me"],
          summary: "Switch mother account type",
          description:
            "Move a mother account between pregnant and postpartum mode while preserving history and restarting the correct onboarding flow.",
          operationId: "me_patch_mother_type",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["motherType"],
                  properties: {
                    motherType: {
                      type: "string",
                      enum: ["pregnant", "postpartum"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: successResponse(
              "Mother type updated successfully.",
              { $ref: "#/components/schemas/AccountResponse" },
              "Mother type updated successfully.",
            ),
            403: problemResponse("Forbidden."),
          },
        },
      },
      "/me/onboarding": {
        patch: {
          tags: ["Me"],
          summary: "Save onboarding progress or complete onboarding",
          description:
            "Persist the current onboarding step and draft data, or mark onboarding as fully completed and clear the progress state.",
          operationId: "me_patch_onboarding",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatchOnboardingInput" },
              },
            },
          },
          responses: {
            200: successResponse(
              "Onboarding updated successfully.",
              { $ref: "#/components/schemas/AccountResponse" },
              "Onboarding updated successfully.",
            ),
            422: problemResponse("Validation failed."),
          },
        },
      },
      "/dashboard/summary": {
        get: {
          tags: ["Dashboard"],
          summary: "Fetch dashboard summary",
          description:
            "Return the normalized mother or linked-partner dashboard summary, including development, checklist, reminders, nutrition, journal previews, and the next appointment.",
          operationId: "dashboard_summary",
          security: [{ bearerAuth: [] }],
          responses: {
            200: successResponse(
              "Dashboard summary loaded successfully.",
              { type: "object", additionalProperties: true },
              "Dashboard summary loaded successfully.",
            ),
            403: problemResponse("Forbidden."),
          },
        },
      },
      "/dashboard/checklist/{itemId}/toggle": {
        patch: {
          tags: ["Dashboard"],
          summary: "Toggle a checklist item",
          description: "Toggle a mother-owned dashboard checklist item.",
          operationId: "dashboard_toggle_checklist",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "itemId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: successResponse(
              "Checklist item updated successfully.",
              { type: "object", additionalProperties: true },
              "Checklist item updated successfully.",
            ),
            403: problemResponse("Forbidden."),
          },
        },
      },
      "/visits": {
        get: {
          tags: ["Visits"],
          summary: "List visits",
          description: "Return upcoming and historical visits for a mother or her linked partner.",
          operationId: "visits_list",
          security: [{ bearerAuth: [] }],
          responses: {
            200: successResponse(
              "Visits loaded successfully.",
              { type: "array", items: { type: "object", additionalProperties: true } },
              "Visits loaded successfully.",
            ),
          },
        },
        post: {
          tags: ["Visits"],
          summary: "Create a visit reminder",
          description: "Create a visit reminder for the authenticated mother account.",
          operationId: "visits_create",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            201: successResponse(
              "Visit created successfully.",
              { type: "object", additionalProperties: true },
              "Visit created successfully.",
            ),
            403: problemResponse("Forbidden."),
          },
        },
      },
      "/emergency/hospitals": {
        get: {
          tags: ["Emergency"],
          summary: "Find nearby hospitals",
          description:
            "Query nearby hospitals and clinics using device coordinates and OpenStreetMap/Overpass.",
          operationId: "emergency_hospitals",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "latitude", in: "query", required: true, schema: { type: "number" } },
            { name: "longitude", in: "query", required: true, schema: { type: "number" } },
          ],
          responses: {
            200: successResponse(
              "Nearby hospitals loaded successfully.",
              { type: "array", items: { type: "object", additionalProperties: true } },
              "Nearby hospitals loaded successfully.",
            ),
          },
        },
      },
      "/chat/messages": {
        get: {
          tags: ["Chat"],
          summary: "List chat history",
          security: [{ bearerAuth: [] }],
          responses: {
            200: successResponse(
              "Chat history loaded successfully.",
              { type: "array", items: { type: "object", additionalProperties: true } },
              "Chat history loaded successfully.",
            ),
          },
        },
        post: {
          tags: ["Chat"],
          summary: "Send a chat message",
          description:
            "Create a user chat message and return an assistant response. Use `Accept: text/event-stream` or `?stream=true` to stream chunked output.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["content"],
                  properties: {
                    content: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: successResponse(
              "Chat response created successfully.",
              { type: "object", additionalProperties: true },
              "Chat response created successfully.",
            ),
          },
        },
        delete: {
          tags: ["Chat"],
          summary: "Clear chat history",
          security: [{ bearerAuth: [] }],
          responses: {
            200: successResponse("Chat cleared successfully.", { nullable: true }, "Chat cleared successfully."),
          },
        },
      },
      "/blogs": {
        get: {
          tags: ["Blogs"],
          summary: "List published blogs",
          responses: {
            200: successResponse(
              "Blogs loaded successfully.",
              { type: "array", items: { type: "object", additionalProperties: true } },
              "Blogs loaded successfully.",
            ),
          },
        },
      },
      "/blogs/admin": {
        get: {
          tags: ["Blogs"],
          summary: "List all blogs for admins",
          security: [{ bearerAuth: [] }],
          responses: {
            200: successResponse(
              "Admin blogs loaded successfully.",
              { type: "array", items: { type: "object", additionalProperties: true } },
              "Admin blogs loaded successfully.",
            ),
          },
        },
        post: {
          tags: ["Blogs"],
          summary: "Create a blog post",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            201: successResponse(
              "Blog created successfully.",
              { type: "object", additionalProperties: true },
              "Blog created successfully.",
            ),
          },
        },
      },
      "/me/notification-tokens": {
        post: {
          tags: ["Me"],
          summary: "Save Expo push token",
          description:
            "Persist a device push-notification token for the authenticated user so notifications can be sent later.",
          operationId: "me_create_notification_token",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NotificationTokenInput" },
              },
            },
          },
          responses: {
            201: successResponse(
              "Notification token saved successfully.",
              { $ref: "#/components/schemas/NotificationToken" },
              "Notification token saved successfully.",
            ),
            422: problemResponse("Validation failed."),
          },
        },
      },
      "/partner-invites": {
        post: {
          tags: ["Partner Invites"],
          summary: "Create a partner invite",
          description:
            "Generate a shareable partner invite token and invite URL for a mother account.",
          operationId: "partner_invites_create",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InviteInput" },
              },
            },
          },
          responses: {
            201: successResponse(
              "Partner invite created successfully.",
              { $ref: "#/components/schemas/PartnerInviteResponse" },
              "Partner invite created successfully.",
            ),
            403: problemResponse("Only mothers can create partner invites."),
          },
        },
      },
      "/partner-invites/{token}": {
        get: {
          tags: ["Partner Invites"],
          summary: "Inspect a partner invite before signup",
          description:
            "Validate a partner invite token and return basic inviter and expiry metadata before partner registration.",
          operationId: "partner_invites_retrieve",
          parameters: [
            {
              name: "token",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Raw invite token sent to the invited partner.",
            },
          ],
          responses: {
            200: successResponse(
              "Partner invite fetched successfully.",
              { $ref: "#/components/schemas/PartnerInviteInspectResponse" },
              "Partner invite fetched successfully.",
            ),
            404: problemResponse("Invite token is invalid or expired."),
          },
        },
      },
      "/admin/auth/login": {
        post: {
          tags: ["Admin"],
          summary: "Login as admin or super admin",
          description:
            "Authenticate an admin or super admin account and return an authenticated session.",
          operationId: "admin_auth_login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginInput" },
              },
            },
          },
          responses: {
            200: successResponse(
              "Admin login successful.",
              { $ref: "#/components/schemas/AuthSessionResponse" },
              "Admin login successful.",
            ),
            401: problemResponse("Invalid credentials."),
          },
        },
      },
      "/admin/admins": {
        get: {
          tags: ["Admin"],
          summary: "List admins",
          description:
            "Return the list of admin and super admin accounts visible to the authenticated admin user.",
          operationId: "admin_admins_list",
          security: [{ bearerAuth: [] }],
          responses: {
            200: successResponse(
              "Admins fetched successfully.",
              {
                type: "array",
                items: { $ref: "#/components/schemas/AccountResponse" },
              },
              "Admins fetched successfully.",
            ),
            403: problemResponse("Forbidden."),
          },
        },
        post: {
          tags: ["Admin"],
          summary: "Create a new admin",
          description:
            "Create a new admin account. Super admins may create additional admins and super admins based on authorization rules.",
          operationId: "admin_admins_create",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateAdminInput" },
              },
            },
          },
          responses: {
            201: successResponse(
              "Admin created successfully.",
              { $ref: "#/components/schemas/AccountResponse" },
              "Admin created successfully.",
            ),
            403: problemResponse("Forbidden."),
            422: problemResponse("Validation failed."),
          },
        },
      },
    },
  };
}
