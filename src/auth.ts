import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { LoginSchema } from '@/lib/schemas';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await db.user.findUnique({ where: { email } });

        console.log('[DEBUG auth] login attempt', {
          email,
          exists: !!user,
          status: user?.status,
          isActive: user?.isActive,
          hasPassword: !!user?.password,
        });

          if (!user || !user.password) return null;

        if (user.isActive === false) return null;
        if (user.status !== 'ACTIVE') return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

        console.log('[DEBUG auth] passwordMatch', passwordsMatch);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.clinicId = user.clinicId;
        token.isActive = user.isActive;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.clinicId = token.clinicId as string;
        session.user.isActive = token.isActive as boolean;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
});
