/**
 * Form Validation Schemas
 * Using Zod for runtime validation
 */

import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, "Invalid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  confirmPassword: z.string(),
  unitId: z.string().optional(), // Keeping for backward compatibility if needed, but made optional
  state: z.string().min(1, "State is required"),
  zone: z.string().min(1, "Zone/Area is required"),
  branch: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Profile Schemas
export const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
});

// Event Creation Schemas
export const eventEssentialsSchema = z.object({
  title: z.string().min(3, "Event title is required"),
  description: z.string().optional(),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  unitId: z.string().min(1, "Organization unit is required"),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const eventCenterSchema = z.object({
  name: z.string().min(2, "Center name is required"),
  state: z.string().min(1, "State is required"),
  area: z.string().optional(),
  zone: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  capacity: z.number().positive("Capacity must be positive").optional(),
  adminIds: z.array(z.string()).optional(),
});

export const eventGroupSchema = z.object({
  name: z.string().min(2, "Group name is required"),
  type: z.enum(["BIBLE_STUDY", "WORKSHOP", "CUSTOM"]),
  description: z.string().optional(),
  capacity: z.number().positive("Capacity must be positive").optional(),
  facilitatorIds: z.array(z.string()).optional(),
  isRequired: z.boolean().default(false),
});

// Registration Schemas
export const participationModeSchema = z.object({
  mode: z.enum(["ONLINE", "ON_SITE", "HYBRID"]),
  centerId: z.string().optional(),
});

export const registrationSchema = z.object({
  participationMode: z.enum(["ONLINE", "ON_SITE", "HYBRID"]),
  centerId: z.string().optional(),
  groupAssignments: z.array(
    z.object({
      groupId: z.string(),
      assigned: z.boolean(),
    })
  ).optional(),
}).refine(
  (data) => {
    if (data.participationMode === "ON_SITE" || data.participationMode === "HYBRID") {
      return !!data.centerId;
    }
    return true;
  },
  {
    message: "Center selection is required for on-site or hybrid events",
    path: ["centerId"],
  }
);

// Bulk Import Schema
export const bulkImportSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type === "text/csv" || file.name.endsWith(".csv"),
    "Only CSV files are accepted"
  ),
  eventId: z.string().min(1, "Event is required"),
  mappings: z.record(z.string(), z.string()),
});

// Consent Schemas
export const consentSchema = z.object({
  terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
  privacy: z.boolean().refine((val) => val === true, "You must accept the privacy policy"),
  dataProcessing: z.boolean().refine((val) => val === true, "You must accept data processing"),
});

// Guardian Schemas
export const guardianSchema = z.object({
  guardianName: z.string().min(2, "Guardian name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, "Invalid phone number"),
  email: z.string().email("Invalid email address").optional(),
  address: z.string().optional(),
});

// Type exports for form usage
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type EventEssentialsData = z.infer<typeof eventEssentialsSchema>;
export type EventCenterData = z.infer<typeof eventCenterSchema>;
export type EventGroupData = z.infer<typeof eventGroupSchema>;
export type ParticipationModeData = z.infer<typeof participationModeSchema>;
export type RegistrationData = z.infer<typeof registrationSchema>;
export type BulkImportData = z.infer<typeof bulkImportSchema>;
export type ConsentData = z.infer<typeof consentSchema>;
export type GuardianData = z.infer<typeof guardianSchema>;
