import { z } from "zod";

const languageSchema = z.enum(["en", "yo", "ha", "ig"]).default("en");

const emergencyContactSchema = z.object({
  name: z.string().trim().optional().default(""),
  phoneNumber: z.string().trim().optional().default(""),
  relationship: z.string().trim().optional().default(""),
});

export const registerMotherSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    motherType: z.enum(["pregnant", "postpartum"]),
    language: languageSchema.optional(),
    fullName: z.string().trim().optional().default(""),
    phoneNumber: z.string().trim().optional().default(""),
    address: z.string().trim().optional().default(""),
    dueDate: z.string().datetime().optional().or(z.literal("")),
    lastPeriodDate: z.string().datetime().optional().or(z.literal("")),
    pregnancyWeek: z.number().int().min(0).max(45).optional(),
    babyName: z.string().trim().optional().default(""),
    babyNickname: z.string().trim().optional().default(""),
    babyBirthDate: z.string().datetime().optional().or(z.literal("")),
    babyBirthWeight: z.string().trim().optional().default(""),
    babyBirthHospital: z.string().trim().optional().default(""),
    healthConcerns: z.string().trim().optional().default(""),
    emergencyContacts: z.array(emergencyContactSchema).optional().default([]),
  }),
});

export const registerPartnerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().trim().optional().default(""),
    phoneNumber: z.string().trim().optional().default(""),
    relationshipLabel: z.string().trim().optional().default(""),
    inviteToken: z.string().trim().min(1),
    language: languageSchema.optional(),
  }),
});

export const registerHealthWorkerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    healthWorkerType: z.enum(["with_clinic", "without_clinic"]),
    fullName: z.string().trim().optional().default(""),
    phoneNumber: z.string().trim().optional().default(""),
    state: z.string().trim().optional().default(""),
    localGovernment: z.string().trim().optional().default(""),
    occupation: z.string().trim().optional().default(""),
    facilityName: z.string().trim().optional().default(""),
    facilityCode: z.string().trim().optional().default(""),
    language: languageSchema.optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const otpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().trim().length(4),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().trim().length(4),
    newPassword: z.string().min(6),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().trim().optional(),
  }).optional().default({}),
});

export const patchProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().optional(),
    phoneNumber: z.string().trim().optional(),
    address: z.string().trim().optional(),
    profilePicture: z.string().url().optional(),
    state: z.string().trim().optional(),
    localGovernment: z.string().trim().optional(),
    occupation: z.string().trim().optional(),
    facilityName: z.string().trim().optional(),
    facilityCode: z.string().trim().optional(),
    relationshipLabel: z.string().trim().optional(),
    emergencyContacts: z.array(emergencyContactSchema).optional(),
    dueDate: z.string().datetime().optional().or(z.literal("")),
    lastPeriodDate: z.string().datetime().optional().or(z.literal("")),
    babyName: z.string().trim().optional(),
    babyNickname: z.string().trim().optional(),
    babyBirthDate: z.string().datetime().optional().or(z.literal("")),
    babyBirthWeight: z.string().trim().optional(),
    babyBirthHospital: z.string().trim().optional(),
    healthConcerns: z.string().trim().optional(),
    pregnancyWeek: z.number().int().min(0).max(45).optional(),
  }),
});

export const patchLanguageSchema = z.object({
  body: z.object({
    language: languageSchema,
  }),
});

export const patchMotherTypeSchema = z.object({
  body: z.object({
    motherType: z.enum(["pregnant", "postpartum"]),
  }),
});

export const patchOnboardingSchema = z.object({
  body: z.object({
    onboardingCompleted: z.boolean(),
    quickSetupSelections: z.array(z.string()).optional(),
    supportCircle: z.array(z.string()).optional(),
    currentStep: z.number().int().min(0).optional(),
    flow: z.string().trim().optional(),
    draft: z.any().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});

export const notificationTokenSchema = z.object({
  body: z.object({
    platform: z.enum(["ios", "android", "web"]),
    expoPushToken: z.string().trim().min(1),
    deviceId: z.string().trim().optional().default(""),
    enabled: z.boolean().optional().default(true),
  }),
});

export const inviteSchema = z.object({
  body: z.object({
    invitedEmail: z.string().email().optional(),
  }),
});

export const inviteParamsSchema = z.object({
  params: z.object({
    token: z.string().trim().min(1),
  }),
});

export const createAdminSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().trim().min(1),
    adminRole: z.enum(["admin", "super_admin"]).default("admin"),
    permissions: z.array(z.string()).optional().default([]),
  }),
});

export const updateAdminSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1),
  }),
  body: z.object({
    fullName: z.string().trim().optional(),
    permissions: z.array(z.string()).optional(),
    status: z.enum(["pending_onboarding", "active", "suspended"]).optional(),
  }),
});

export const updateAccountStatusSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1),
  }),
  body: z.object({
    status: z.enum(["pending_onboarding", "active", "suspended"]),
  }),
});
