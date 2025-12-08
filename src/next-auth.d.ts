import NextAuth, { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      clinicId: string;
      isActive: boolean;
      status: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    clinicId: string;
    isActive: boolean;
    status: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    clinicId: string;
    isActive: boolean;
    status: string;
  }
}
