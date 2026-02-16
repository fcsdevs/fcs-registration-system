/**
 * API Types - Complete type definitions for all backend endpoints
 * Based on backend API documentation and Prisma schema
 */

// ============================================================
// COMMON TYPES
// ============================================================

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ============================================================
// AUTH MODULE TYPES
// ============================================================

export interface RegisterRequest {
  phoneNumber: string;
  email?: string | null;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  otherNames?: string | null;
  preferredName?: string | null;
  whatsappNumber?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  maritalStatus?: string | null;
  occupation?: string | null;
  department?: string | null;
  placeOfWork?: string | null;
  institutionName?: string | null;
  institutionType?: string | null;
  level?: string | null;
  course?: string | null;
  graduationYear?: string | number | null;
  membershipCategory: string;
  yearJoined?: string | number | null;
  state?: string | null;
  zone?: string | null;
  branch?: string | null;
  branchId?: string | null;
  preferredContactMethod?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  ageBracket?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  guardianRelationship?: string | null;
  privacyPolicyAccepted: boolean;
  termsAccepted: boolean;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    phoneNumber: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  token: string;
  refreshToken: string;
}

export interface SendOTPRequest {
  phoneNumber?: string;
  email?: string;
  purpose: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION' | 'PASSWORD_RESET' | 'REGISTRATION';
}

export interface ForgotPasswordRequest {
  identifier: string; // Email or FCS Code
}

export interface ResetPasswordRequest {
  email?: string;
  phoneNumber?: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyOTPRequest {
  phoneNumber?: string;
  email?: string;
  code: string;
  purpose?: string;
}

export interface CurrentUser {
  id: string;
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  roles?: string[];
  unit?: any;
  centers?: Array<{
    id: string;
    centerName: string;
    eventId: string;
  }>;
}

// ============================================================
// MEMBER MODULE TYPES
// ============================================================

export interface Member {
  id: string;
  fcsCode: string;
  authUserId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  occupation?: string;
  department?: string;
  state?: string;
  profilePhotoUrl?: string;
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  guardians?: Guardian[];
  guardianOf?: Guardian[];
}

export interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  occupation?: string;
  department?: string;
  state?: string;
}

export interface UpdateMemberRequest {
  firstName?: string;
  lastName?: string;
  otherNames?: string | null;
  preferredName?: string | null;
  email?: string;
  phoneNumber?: string;
  whatsappNumber?: string | null;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  occupation?: string | null;
  department?: string | null;
  placeOfWork?: string | null;
  institutionName?: string | null;
  institutionType?: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'UNIVERSITY' | 'POLYTECHNIC' | 'COLLEGE_OF_EDUCATION' | 'OTHER' | null;
  level?: string | null;
  course?: string | null;
  graduationYear?: number | null;
  membershipCategory?: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'ASSOCIATE' | 'STAFF';
  yearJoined?: number | null;
  state?: string | null;
  zone?: string | null;
  branch?: string | null;
  branchId?: string | null;
  preferredContactMethod?: 'SMS' | 'EMAIL' | 'WHATSAPP' | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  ageBracket?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  guardianRelationship?: string | null;
  profilePhotoUrl?: string;
}

export interface Guardian {
  id: string;
  memberId: string;
  guardianId: string;
  relationship: string;
  createdAt: string;
}

export interface AddGuardianRequest {
  guardianId: string;
  relationship: string;
}

export interface MemberAttendanceSummary {
  member: {
    id: string;
    name: string;
    fcsCode: string;
  };
  statistics: {
    totalAttendance: number;
    attendanceRate: number;
    byMode: Array<{
      mode: string;
      count: number;
    }>;
  };
}

export interface ListMembersParams extends PaginationParams {
  search?: string;
  state?: string;
  isActive?: boolean;
}

// ============================================================
// EVENT MODULE TYPES
// ============================================================

export interface Event {
  id: string;
  title: string;
  description?: string;
  unitId: string;
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  participationMode: 'ONLINE' | 'ONSITE' | 'HYBRID';
  isPublished: boolean;
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  unit?: {
    id: string;
    name: string;
  };
  centers?: EventCenter[];
  settings?: EventSettings;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  unitId: string;
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  participationMode: 'ONLINE' | 'ONSITE' | 'HYBRID';
  imageUrl?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  registrationStart?: string;
  registrationEnd?: string;
  participationMode?: 'ONLINE' | 'ONSITE' | 'HYBRID';
  imageUrl?: string;
}

export interface EventSettings {
  id: string;
  eventId: string;
  requireGroupAssignment: boolean;
  allowSelfRegistration: boolean;
  allowThirdPartyRegistration: boolean;
  requireParentalConsent: boolean;
  groupAssignmentMethod?: 'MANUAL' | 'AUTOMATIC' | 'OPTIONAL';
}

export interface UpdateEventSettingsRequest {
  requireGroupAssignment?: boolean;
  allowSelfRegistration?: boolean;
  allowThirdPartyRegistration?: boolean;
  requireParentalConsent?: boolean;
  groupAssignmentMethod?: 'MANUAL' | 'AUTOMATIC' | 'OPTIONAL';
}

export interface EventStatistics {
  eventId: string;
  title: string;
  participationMode: string;
  totalRegistrations: number;
  totalAttendance: number;
  attendanceRate: number;
  registrationsByMode: Array<{
    mode: string;
    count: number;
  }>;
  attendanceByMode: Array<{
    mode: string;
    count: number;
  }>;
  centerStatistics: Array<{
    centerId: string;
    centerName: string;
    registrations: number;
    attendance: number;
    state?: string;
  }>;
}

export interface ListEventsParams extends PaginationParams {
  search?: string;
  unitId?: string;
  participationMode?: 'ONLINE' | 'ONSITE' | 'HYBRID';
  isPublished?: boolean;
}

// ============================================================
// CENTER MODULE TYPES
// ============================================================

export interface EventCenter {
  id: string;
  eventId: string;
  centerName: string;
  country: string;
  stateId?: string;
  state?: {
    id: string;
    name: string;
  };
  address: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    title: string;
    participationMode: string;
  };
  admins?: Array<{
    id: string;
    user?: {
      id: string;
      email: string;
      phoneNumber: string;
    };
  }>;
  _count?: {
    registrations: number;
    attendances: number;
    participations: number;
  };
}

export interface CreateCenterRequest {
  eventId: string;
  centerName: string;
  country?: string;
  stateId?: string;
  address: string;
}

export interface UpdateCenterRequest {
  centerName?: string;
  address?: string;
  isActive?: boolean;
}

export interface CenterStatistics {
  centerId: string;
  centerName: string;
  registrations: number;
  attendance: number;
  groups: number;
}

export interface ListCentersParams extends PaginationParams {
  eventId?: string;
  isActive?: boolean;
}

export interface ListActiveCentersParams extends PaginationParams {
  eventId: string;
  state?: string;
}

export interface ListAllCentersParams extends PaginationParams {
  eventId?: string;
  isActive?: boolean;
  search?: string;
}

// ============================================================
// REGISTRATION MODULE TYPES
// ============================================================

export interface Registration {
  id: string;
  eventId: string;
  memberId: string;
  centerId?: string;
  groupId?: string;
  attendanceIntent?: 'CONFIRMED' | 'TENTATIVE';
  participationMode: 'ONLINE' | 'ONSITE' | 'HYBRID';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED' | 'CHECKED_IN';
  registeredBy: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    fcsCode: string;
    profilePhotoUrl?: string;
  };
  event?: {
    id: string;
    title: string;
    startDate?: string;
    endDate?: string;
    participationMode?: 'ONLINE' | 'ONSITE' | 'HYBRID';
  };
  center?: {
    id: string;
    name: string;
    centerName?: string;
  };
  group?: {
    id: string;
    name: string;
  };
  participation?: {
    center?: {
      id: string;
      centerName: string;
      address?: string;
    };
    participationMode?: string;
  };
  groupAssignments?: {
    group?: {
      id: string;
      name: string;
      type?: string;
    };
  }[];
}

export interface CreateRegistrationRequest {
  eventId: string;
  memberId: string;
  centerId?: string;
  participationMode?: 'ONLINE' | 'ONSITE' | 'HYBRID';
  attendanceIntent?: 'CONFIRMED' | 'TENTATIVE';
}

export interface UpdateRegistrationStatusRequest {
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
  reason?: string;
}

export interface AssignCenterRequest {
  centerId: string;
  participationMode: 'ONLINE' | 'ONSITE' | 'HYBRID';
}

export interface AssignGroupRequest {
  groupId: string;
}

export interface ListRegistrationsParams extends PaginationParams {
  eventId?: string;
  memberId?: string;
  centerId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
  search?: string;
  registeredBy?: string;
}

// ============================================================
// ATTENDANCE MODULE TYPES
// ============================================================

export interface AttendanceRecord {
  id: string;
  eventId: string;
  registrationId: string;
  centerId?: string;
  checkInTime: string;
  checkOutTime?: string;
  checkInMethod: 'QR' | 'SAC' | 'MANUAL' | 'KIOSK';
  participationMode: 'ONLINE' | 'ONSITE' | 'HYBRID';
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    name: string;
    fcsCode: string;
  };
  center?: {
    id: string;
    name: string;
  };
}

export interface CheckInRequest {
  eventId: string;
  registrationId: string;
  centerId?: string;
  checkInMethod: 'QR' | 'SAC' | 'MANUAL' | 'KIOSK';
  notes?: string;
}

export interface CheckOutRequest {
  attendanceId: string;
  notes?: string;
}

export interface BulkSyncRequest {
  records: Array<{
    eventId: string;
    registrationId: string;
    centerId?: string;
    checkInMethod: 'QR' | 'SAC' | 'MANUAL' | 'KIOSK';
    checkInTime: string;
    idempotencyKey: string;
  }>;
}

export interface BulkSyncResponse {
  synced: number;
  duplicates: number;
  conflicts: number;
  errors: number;
  details: Array<{
    idempotencyKey: string;
    status: 'success' | 'duplicate' | 'conflict' | 'error';
  }>;
}

export interface CorrectAttendanceRequest {
  correctionType: 'CHECK_IN_TIME' | 'CHECK_OUT_TIME' | 'CENTER' | 'MODE';
  newValue: string;
  reason: string;
}

export interface AttendanceCode {
  id: string;
  code: string;
  eventId: string;
  codeType: 'QR' | 'SAC';
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
}

export interface GenerateCodeRequest {
  eventId: string;
  codeType?: 'QR' | 'SAC';
}

export interface ValidateCodeRequest {
  code: string;
}

export interface GetAttendanceParams extends PaginationParams {
  centerId?: string;
  verified?: boolean;
  participationMode?: 'ONLINE' | 'ONSITE' | 'HYBRID';
  eventId?: string;
  fromDate?: string;
  toDate?: string;
}

// ============================================================
// GROUP MODULE TYPES
// ============================================================

export interface EventGroup {
  id: string;
  eventId: string;
  name: string;
  type: 'BIBLE_STUDY' | 'WORKSHOP' | 'SEMINAR';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
}

export interface CreateGroupRequest {
  eventId: string;
  name: string;
  type: 'BIBLE_STUDY' | 'WORKSHOP' | 'SEMINAR';
  description?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
}

export interface GroupMember {
  registrationId: string;
  member: {
    id: string;
    name: string;
    fcsCode: string;
  };
  participationMode: string;
  joinedAt: string;
}

export interface AssignMemberRequest {
  memberId: string;
}

export interface BulkAssignRequest {
  eventId: string;
  strategy: 'manual' | 'auto';
  assignments: Array<{
    groupId: string;
    memberId: string;
  }>;
}

export interface BulkAssignResponse {
  assigned: number;
  failed: number;
  errors: Array<{
    groupId: string;
    memberId: string;
    error: string;
  }>;
}

export interface GroupStatistics {
  group: {
    id: string;
    name: string;
    type: string;
  };
  statistics: {
    totalMembers: number;
    totalAttendance: number;
    attendanceRate: number;
  };
  attendanceByMode: Array<{
    mode: string;
    count: number;
  }>;
}

export interface ListGroupsParams extends PaginationParams {
  type?: 'BIBLE_STUDY' | 'WORKSHOP' | 'SEMINAR';
  isActive?: boolean;
}

// ============================================================
// UNIT MODULE TYPES
// ============================================================

export interface Unit {
  id: string;
  name: string;
  type: string;
  code: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    name: string;
  };
  parentUnit?: {
    id: string;
    name: string;
  };
  childUnits?: Array<{
    id: string;
    name: string;
  }>;
  leader?: {
    id: string;
    name: string;
    email: string;
  };
  childUnitCount?: number;
  memberCount?: number;
  eventCount?: number;
}

export interface CreateUnitRequest {
  name: string;
  type: string;
  parentUnitId?: string;
  description?: string;
  leaderId?: string;
}

export interface UpdateUnitRequest {
  name?: string;
  description?: string;
  leaderId?: string;
}

export interface UnitHierarchy {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  children: UnitHierarchy[];
}

export interface UnitStatistics {
  unit: {
    id: string;
    name: string;
    type: string;
  };
  statistics: {
    members: number;
    events: number;
    registrations: number;
    childUnits: number;
  };
  membersByState: Array<{
    state: string;
    count: number;
  }>;
}

export interface ListUnitsParams extends PaginationParams {
  type?: string;
  parentUnitId?: string;
  recursive?: boolean;
  search?: string;
}

// ============================================================
// ROLE MODULE TYPES
// ============================================================

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  _count?: {
    users: number;
  };
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
  unitScope?: boolean;
}

export interface UpdateRoleRequest {
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  unitId?: string;
  assignedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  role?: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export interface AssignRoleRequest {
  unitId?: string;
}

export interface UserPermissions {
  userId: string;
  permissions: string[];
}

export interface PermissionCheck {
  userId: string;
  permission: string;
  hasPermission: boolean;
}

export interface PermissionGroups {
  events: string[];
  members: string[];
  attendance: string[];
  reports: string[];
  administration: string[];
}

export interface ListRolesParams extends PaginationParams {
  search?: string;
  isActive?: boolean;
}

// ============================================================
// REPORT MODULE TYPES
// ============================================================

export interface DashboardData {
  overview: {
    totalMembers: number;
    activeEvents: number;
    thisMonthRegistrations: number;
    thisMonthAttendance: number;
    attendanceRate: number;
  };
  topEvents: Array<{
    id: string;
    name: string;
    registrations: number;
    attendance: number;
  }>;
}

export interface EventAnalytics {
  event: {
    id: string;
    name: string;
    startDate: string;
    unit: {
      id: string;
      name: string;
    };
  };
  overview: {
    totalRegistrations: number;
    totalAttendance: number;
    attendanceRate: number;
    totalCenters: number;
  };
  registrationsByMode: Array<{
    mode: string;
    count: number;
  }>;
  attendanceByMode: Array<{
    mode: string;
    count: number;
  }>;
  centerStats: Array<{
    centerId: string;
    name: string;
    registrations: number;
    attendance: number;
    utilizationRate: number;
  }>;
}

export interface MemberAttendanceReport {
  member: {
    id: string;
    name: string;
    fcsCode: string;
    email?: string;
    state?: string;
  };
  statistics: {
    totalAttendance: number;
    attendanceByMode: Array<{
      mode: string;
      count: number;
    }>;
  };
  eventAttendance: Array<{
    event: {
      id: string;
      name: string;
      startDate: string;
    };
    attendance: Array<{
      recordId: string;
      center?: {
        id: string;
        name: string;
      };
      checkInTime: string;
      duration?: number;
      mode: string;
    }>;
  }>;
}

export interface StateAnalytics {
  memberDistribution: Array<{
    state: string;
    count: number;
  }>;
  centerDistribution: Array<{
    state: string;
    count: number;
  }>;
  period: {
    startDate?: string;
    endDate?: string;
  };
}

export interface ExportParams {
  format: 'json' | 'csv';
  startDate?: string;
  endDate?: string;
}

// ============================================================
// AUDIT MODULE TYPES
// ============================================================

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes?: Record<string, any>;
  userId: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ComplianceReport {
  period: {
    startDate: string;
    endDate: string;
  };
  sensitiveOperations: number;
  failedOperations: number;
  actionSummary: Record<string, number>;
  userSummary: Record<string, number>;
  recentSensitiveOps: AuditLog[];
  recentFailures: AuditLog[];
}

export interface DataChangeHistory {
  entity: {
    type: string;
    id: string;
  };
  field?: string;
  history: Array<{
    timestamp: string;
    action: string;
    oldValue?: any;
    newValue?: any;
    changedBy: string;
  }>;
}

export interface GetAuditLogsParams extends PaginationParams {
  startDate?: string;
  endDate?: string;
  entityType?: string;
  userId?: string;
  action?: string;
}

export interface CleanupLogsRequest {
  daysRetention: number;
}

// ============================================================
// NOTIFICATION MODULE TYPES
// ============================================================

export interface NotificationTrigger {
  id: string;
  eventId: string;
  triggerType: 'REGISTRATION' | 'CENTER_ASSIGNMENT' | 'GROUP_ASSIGNMENT' | 'EVENT_REMINDER';
  deliveryMethod: 'EMAIL' | 'SMS' | 'PUSH';
  templateId?: string;
  recipientType: 'MEMBER' | 'GUARDIAN' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface CreateTriggerRequest {
  eventId: string;
  triggerType: 'REGISTRATION' | 'CENTER_ASSIGNMENT' | 'GROUP_ASSIGNMENT' | 'EVENT_REMINDER';
  deliveryMethod: 'EMAIL' | 'SMS' | 'PUSH';
  templateId?: string;
  recipientType: 'MEMBER' | 'GUARDIAN' | 'ADMIN';
}

export interface UpdateTriggerRequest {
  isActive?: boolean;
}

export interface SendNotificationRequest {
  recipientEmail: string;
  deliveryMethod: 'EMAIL' | 'SMS' | 'PUSH';
  subject: string;
  message: string;
  triggerType: string;
}

export interface SendBatchRequest {
  recipients: Array<{
    id: string;
    email?: string;
    phone?: string;
  }>;
  deliveryMethod: 'EMAIL' | 'SMS' | 'PUSH';
  subject: string;
  message: string;
  triggerType: string;
}

export interface BatchNotificationResponse {
  sent: number;
  failed: number;
  details: Array<{
    recipientId: string;
    status: string;
  }>;
}

export interface NotificationHistory {
  id: string;
  recipientId: string;
  deliveryMethod: string;
  subject?: string;
  status: 'PENDING' | 'DELIVERED' | 'FAILED';
  createdAt: string;
  deliveredAt?: string;
}

export interface GetNotificationHistoryParams extends PaginationParams {
  recipientId?: string;
  status?: 'PENDING' | 'DELIVERED' | 'FAILED';
  triggerType?: string;
}
