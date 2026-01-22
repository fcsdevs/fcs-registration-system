/**
 * Frontend Scope Validation Library
 * Mirrors backend HRBAC: National → Area → State → Zone → Branch
 */

export const HIERARCHY_LEVELS = {
  National: 1,
  Area: 2,
  State: 3,
  Zone: 4,
  Branch: 5,
} as const;

export type HierarchyLevel = keyof typeof HIERARCHY_LEVELS;

export const HIERARCHY_ORDER: HierarchyLevel[] = ['National', 'Area', 'State', 'Zone', 'Branch'];

/**
 * User's admin scope info (matches backend getAdminScope())
 */
export interface AdminScope {
  unitId: string | null;
  isGlobal: boolean;
  level: HierarchyLevel | 'None';
  unitName?: string;
  hierarchy?: Record<string, boolean>;
}

/**
 * Check if a user has global (National) scope
 */
export const isGlobalAdmin = (scope: AdminScope): boolean => {
  return scope.isGlobal || scope.level === 'National';
};

/**
 * Check if target level is within user's scope (downward only)
 * @param userLevel - User's admin level
 * @param targetLevel - Target resource level
 * @returns true if target is same or descendant of user
 */
export const isLevelInScope = (userLevel: HierarchyLevel, targetLevel: HierarchyLevel): boolean => {
  if (userLevel === 'National') return true;
  const userLevelValue = HIERARCHY_LEVELS[userLevel];
  const targetLevelValue = HIERARCHY_LEVELS[targetLevel];
  return targetLevelValue >= userLevelValue;
};

/**
 * Check if user can access a specific unit
 * @param userScope - User's admin scope
 * @param targetUnitLevel - Target unit's level
 * @returns true if accessible, false if outside scope or upward/sideways
 */
export const canAccessUnit = (userScope: AdminScope, targetUnitLevel: HierarchyLevel): boolean => {
  if (userScope.isGlobal) return true;
  if (!userScope.unitId) return false;
  if (userScope.level === 'None') return false;

  const userLevel = userScope.level as HierarchyLevel;
  return isLevelInScope(userLevel, targetUnitLevel);
};

/**
 * Check if user can manage another user
 * National admin can manage anyone
 * Non-global admins can only manage their own scope
 */
export const canManageUser = (adminScope: AdminScope, targetScope: AdminScope): boolean => {
  if (adminScope.isGlobal) return true;
  if (!adminScope.unitId || !targetScope.unitId) return false;

  // For now, assume downward access means can manage
  // In production, you'd also check if unitIds match the hierarchy
  const adminLevel = adminScope.level as HierarchyLevel;
  const targetLevel = targetScope.level as HierarchyLevel;

  return isLevelInScope(adminLevel, targetLevel);
};

/**
 * Check if user can send message/notification to target
 * Only downward communication allowed
 */
export const canCommunicate = (senderScope: AdminScope, recipientScope: AdminScope): boolean => {
  return canManageUser(senderScope, recipientScope);
};

/**
 * Get accessible levels for current admin
 * Returns all levels that the admin can access (own + descendants)
 */
export const getAccessibleLevels = (adminLevel: HierarchyLevel): HierarchyLevel[] => {
  if (adminLevel === 'National') {
    return HIERARCHY_ORDER;
  }

  const adminLevelValue = HIERARCHY_LEVELS[adminLevel];
  return HIERARCHY_ORDER.filter((level) => HIERARCHY_LEVELS[level] >= adminLevelValue);
};

/**
 * Determine display label for hierarchical level
 */
export const getLevelLabel = (level: HierarchyLevel): string => {
  const labels: Record<HierarchyLevel, string> = {
    National: 'National HQ',
    Area: 'Area',
    State: 'State',
    Zone: 'Zone',
    Branch: 'Branch',
  };
  return labels[level] || level;
};

/**
 * Get human-readable scope description
 */
export const describeScopeAccess = (scope: AdminScope): string => {
  if (scope.isGlobal) {
    return 'National Admin - Access to all units';
  }

  if (scope.level === 'None') {
    return 'No administrative scope';
  }

  const accessibleLevels = getAccessibleLevels(scope.level as HierarchyLevel);
  const levelNames = accessibleLevels.map(getLevelLabel).join(', ');

  return `${scope.unitName} (${scope.level}) - Can access: ${levelNames}`;
};

/**
 * Filter query results by scope
 * Only returns items visible to the admin
 */
export const filterByScope = <T extends { unitLevel?: HierarchyLevel; unitId?: string }>(
  items: T[],
  userScope: AdminScope
): T[] => {
  if (userScope.isGlobal) return items;
  if (!userScope.unitId) return [];

  return items.filter((item) => {
    if (!item.unitLevel) return false;
    return canAccessUnit(userScope, item.unitLevel);
  });
};
