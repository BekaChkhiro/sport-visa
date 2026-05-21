export function roleDashboardPath(role: string): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'CLUB') return '/dashboard/club';
  return '/dashboard/footballer';
}
