import type { Role, Permission } from '@/lib/types';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: Role;
    permissions?: Permission[];
  }

  interface Session {
    user?: DefaultSession['user'] & {
      role?: Role;
      permissions?: Permission[];
    };
    role?: Role;
    permissions?: Permission[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: Role;
    permissions?: Permission[];
  }
}