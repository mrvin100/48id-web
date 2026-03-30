import { UserRole } from '@/types/auth.types'

type RoleInput = string[] | string | null | undefined

const normalizeRoles = (roles: RoleInput): string[] => {
  if (!roles) return []
  if (Array.isArray(roles)) return roles.map(r => r.trim())
  return roles.split(',').map(r => r.trim())
}

export const hasAdminRole = (roles: RoleInput): boolean =>
  normalizeRoles(roles).some(role => role === 'ROLE_ADMIN' || role === 'ADMIN')

export const hasOperatorRole = (roles: RoleInput): boolean =>
  normalizeRoles(roles).some(
    role => role === 'ROLE_OPERATOR' || role === 'OPERATOR'
  )

export const hasStudentRole = (roles: RoleInput): boolean =>
  normalizeRoles(roles).some(
    role => role === 'ROLE_STUDENT' || role === 'STUDENT'
  )

/**
 * Resolves the primary display role for a user.
 *
 * Role hierarchy for rendering/navigation purposes:
 *   ADMIN > STUDENT (with optional OPERATOR capability)
 *
 * OPERATOR is NOT a standalone login role — it is a capability granted to STUDENTS
 * who own or collaborate on operator accounts. A student with ROLE_OPERATOR in their
 * JWT is still primarily a STUDENT. They switch to operator view via the operator store.
 *
 * Only pure OPERATOR accounts (no STUDENT role) get the operator primary role —
 * but in practice this scenario doesn't exist in this system.
 */
export const resolvePrimaryRole = (roles: RoleInput): UserRole => {
  if (hasAdminRole(roles)) return UserRole.ADMIN
  // STUDENT takes priority over OPERATOR — operator is a capability, not a primary role
  if (hasStudentRole(roles)) return UserRole.STUDENT
  if (hasOperatorRole(roles)) return UserRole.OPERATOR
  return UserRole.STUDENT
}

/**
 * Require a specific role to access a resource.
 * Returns true if the user has the required role, false otherwise.
 *
 * @param requiredRole - The role required to access the resource
 * @param userRoles - The user's roles (from token or session)
 * @returns boolean - true if user has the required role
 *
 * @example
 * // In a page component
 * const role = await getServerUserRole()
 * if (!requireRole(UserRole.ADMIN, role)) {
 *   redirect('/access-denied')
 * }
 */
export const requireRole = (
  requiredRole: UserRole,
  userRoles: RoleInput
): boolean => {
  if (requiredRole === UserRole.ADMIN) return hasAdminRole(userRoles)
  if (requiredRole === UserRole.OPERATOR) return hasOperatorRole(userRoles)
  return hasStudentRole(userRoles)
}

/**
 * Require any of the specified roles to access a resource.
 * Returns true if the user has at least one of the required roles.
 *
 * @param requiredRoles - Array of roles that can access the resource
 * @param userRoles - The user's roles (from token or session)
 * @returns boolean - true if user has at least one of the required roles
 *
 * @example
 * // Allow both ADMIN and OPERATOR to access audit logs
 * if (!requireAnyRole([UserRole.ADMIN, UserRole.OPERATOR], role)) {
 *   redirect('/access-denied')
 * }
 */
export const requireAnyRole = (
  requiredRoles: UserRole[],
  userRoles: RoleInput
): boolean => {
  return requiredRoles.some(role => requireRole(role, userRoles))
}
