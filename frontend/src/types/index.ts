/**
 * FCS Nigeria Registration System - Core Type Definitions
 */

// Organizational Hierarchy
export type OrganizationalLevel = "National" | "Region" | "Area" | "State" | "Zone" | "Branch";

export interface OrganizationalUnit {
  id: string;
  name: string;
  level: OrganizationalLevel;
  parentId?: string;
  code: string;
  metadata?: Record<string, any>;
}

// User & Membership
export type UserRole =
  | "admin"
  | "leader"
  | "volunteer"
  | "center_admin"
  | "member"
  | "parent";

export type MembershipStatus = "primary" | "secondary" | "tertiary" | "associate";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: string;
  avatar?: string;
  roles: UserRole[];
  unitId: string;
  level?: OrganizationalLevel;
  membershipStatus?: MembershipStatus;
  memberCode: string;
  createdAt: string;
  updatedAt: string;
}

// Events & Participation
export type ParticipationMode = "ONLINE" | "ONSITE" | "HYBRID";
export type EventStatus = "draft" | "published" | "active" | "completed" | "cancelled";

export interface EventCenter {
  id: string;
  name: string;
  state: string;
  area?: string;
  zone?: string;
  address: string;
  capacity?: number;
  adminIds: string[];
  isActive: boolean;
  latitude?: number;
  longitude?: number;
}

export interface BibleStudyGroup {
  id: string;
  eventId: string;
  name: string;
  type: "BIBLE_STUDY" | "WORKSHOP" | "CUSTOM";
  description?: string;
  capacity?: number;
  facilitatorIds: string[];
  isRequired: boolean;
  maxAssignments?: number;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  participationMode: ParticipationMode;
  unit?: OrganizationalUnit;
  centers?: EventCenter[];
  groups?: BibleStudyGroup[];
  status: EventStatus;
  visibility: "public" | "private";
  registrationStart: string;
  registrationEnd: string;
  registrationOpen: boolean;
  maxCapacity?: number;
  unitId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// Registration
export type RegistrationType = "self" | "for-others" | "group" | "bulk";

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  participationMode: ParticipationMode;
  centerId?: string;
  groupAssignments: { groupId: string; assigned: boolean }[];
  registrationType: RegistrationType;
  status: "registered" | "checked-in" | "cancelled";
  qrCode: string;
  sac?: string;
  registeredAt: string;
  checkedInAt?: string;
}

// Attendance
export type CheckInMethod = "QR" | "SAC" | "PHONE_LOOKUP" | "PHOTO_CONFIRMATION";

export interface AttendanceRecord {
  id: string;
  eventId: string;
  userId: string;
  centerId?: string;
  checkInTime: string;
  checkInMethod: CheckInMethod;
  kioskId?: string;
  verified: boolean;
  notes?: string;
}

// Profile & Dependents
export interface Profile {
  id: string;
  userId: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  profileImage?: string;
  bio?: string;
  joinDate: string;
  preferences?: Record<string, any>;
}

export interface Guardian {
  id: string;
  userId: string;
  guardianName: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Dependent {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: "child" | "sibling" | "other";
  membershipStatus?: MembershipStatus;
  memberCode?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

// Offline Data
export interface OfflineQueue {
  id: string;
  timestamp: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  endpoint: string;
  payload: Record<string, any>;
  status: "pending" | "synced" | "failed";
  retries: number;
}

// Consent & Compliance
export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: "TERMS" | "PRIVACY" | "DATA_PROCESSING" | "MARKETING";
  given: boolean;
  givenAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// Reports
export interface RegistrationSummary {
  eventId: string;
  totalRegistrations: number;
  byParticipationMode: Record<ParticipationMode, number>;
  byCenter: Record<string, number>;
  byGroup: Record<string, number>;
}

export interface AttendanceSummary {
  eventId: string;
  totalAttended: number;
  attendanceRate: number;
  byCenter: Record<string, { attended: number; registered: number }>;
  byCheckInMethod: Record<CheckInMethod, number>;
}
