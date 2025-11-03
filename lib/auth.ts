/**
 * Simple password authentication for admin routes
 */
export function verifyAdminPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}

/**
 * Extract password from Authorization header
 */
export function getPasswordFromHeader(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  // Support "Bearer <password>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
}

/**
 * Verify admin authentication from request
 */
export function verifyAdminAuth(request: Request): boolean {
  const password = getPasswordFromHeader(request);
  if (!password) return false;
  return verifyAdminPassword(password);
}

