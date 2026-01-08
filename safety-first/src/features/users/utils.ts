/**
 * Role display mapping for user roles
 * Maps database role values to Hebrew labels
 */

export const ROLE_LABELS: Record<string, string> = {
  manager: 'מנהל',
  it_admin: 'מנהל מערכת'
}

/**
 * Get Hebrew label for a role
 * @param role - Role value from database
 * @returns Hebrew label for display
 */
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role
}
