import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByEmail, verifyPassword, ROLE_PERMISSIONS } from '@/lib/auth';
import type { Role, Permission } from '@/lib/types';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email || '';
        const password = credentials?.password || '';
        if (!email || !password) return null;
        const user = await getUserByEmail(email);
        if (!user) return null;
        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;
        const role: Role = (user.role as Role) || 'viewer';
        const permissions: Permission[] = user.permissions || ROLE_PERMISSIONS[role];
        return {
          id: (user._id ? String(user._id) : user.email),
          email: user.email,
          name: user.name || '',
          role,
          permissions,
        };
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      session.role = token.role;
      session.permissions = token.permissions;
      return session;
    },
  },
};

export default NextAuth(authOptions);