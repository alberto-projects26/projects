import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Simple credential check - in production use a database
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$YourHashedPasswordHere';

export const config = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.password) return null;
        
        // For demo/simple setup - plain text comparison
        // In production use: await bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH)
        const validPassword = process.env.ADMIN_PASSWORD || 'missioncontrol2025';
        
        if (credentials.password === validPassword) {
          return { id: '1', name: 'Commander', email: 'admin@mission-control.local' };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async session({ session, token }) {
      session.user = token.user as any;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    }
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);