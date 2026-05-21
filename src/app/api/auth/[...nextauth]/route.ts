// NextAuth v5 mounts both GET and POST handlers on the same catch-all path.
// Edge runtime is intentionally NOT used here — authorize() calls bcrypt and
// Prisma, both of which require Node.
export { GET, POST } from '@/lib/auth/handlers';
