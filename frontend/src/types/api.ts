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
  email?: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  phoneNumber: string;
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
  phoneNumber: string;
  purpose: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION' | 'PASSWORD_RESET';
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
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
  state?: string;
}

export interface UpdateMemberRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  occupation?: string;
  state?: string;
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
  capacity?: number;
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
  capacity?: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  registrationStart?: string;
  registrationEnd?: string;
  participationMode?: 'ONLINE' | 'ONSITE' | 'HYBRID';
  capacity?: number;
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
  event: {
    id: string;
    name: string;
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
    state: string;
    capacity: number;
    registrations: number;
    attendance: number;
    utilizationRate: number;
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
  address: string;
  capacity?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    name: string;
  };
  admins?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export interface CreateCenterRequest {
  eventId: string;
  centerName: string;
  country?: string;
  stateId?: string;
  address: string;
  capacity?: number;
}

export interface UpdateCenterRequest {
  centerName?: string;
  address?: string;
  capacity?: number;
}

export interface CenterStatistics {
  center: {
    id: string;
    name: string;
    state: string;
    capacity: number;
  };
  event: {
    id: string;
    name: string;
  };
  statistics: {
    totalRegistrations: number;
    totalAttendance: number;
    attendanceRate: number;
    capacityUtilization: number;
    spotsAvailable: number;
  };
  registrationsByMode: Array<{
    mode: string;
    count: number;
  }>;
  attendanceByMode: Array<{
    mode: string;
    count: number;
  }>;
}

export interface ListCentersParams extends PaginationParams {
  eventId?: string;
  isActive?: boolean;
}

export interface ListActiveCentersParams {
  eventId: string;
  state?: string;
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
  participationMode: 'ONLINE' | 'ONSITE';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
  registeredBy: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    name: string;
    fcsCode: string;
  };
  event?: {
    id: string;
    name: string;
  };
  center?: {
    id: string;
    name: string;
  };
  group?: {
    id: string;
    name: string;
  };
}

export interface CreateRegistrationRequest {
  eventId: string;
  memberId: string;
  centerId?: string;
  participationMode?: 'ONLINE' | 'ONSITE';
}

export interface UpdateRegistrationStatusRequest {
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
  reason?: string;
}

export interface AssignCenterRequest {
  centerId: string;
  participationMode: 'ONLINE' | 'ONSITE';
}

export interface AssignGroupRequest {
  groupId: string;
}

export interface ListRegistrationsParams extends PaginationParams {
  eventId?: string;
  memberId?: string;
  centerId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
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
  participationMode: 'ONLINE' | 'ONSITE';
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
  participationMode?: 'ONLINE' | 'ONSITE';
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
  type: 'BIBLE_STUDY' | 'WORKSHOP' | 'BREAKOUT';
  description?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  spotsAvailable?: number;
}

export interface CreateGroupRequest {
  eventId: string;
  name: string;
  type: 'BIBLE_STUDY' | 'WORKSHOP' | 'BREAKOUT';
  description?: string;
  capacity?: number;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  capacity?: number;
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
    capacityUtilization: number;
  };
  attendanceByMode: Array<{
    mode: string;
    count: number;
  }>;
}

export interface ListGroupsParams extends PaginationParams {
  type?: 'BIBLE_STUDY' | 'WORKSHOP' | 'BREAKOUT';
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
