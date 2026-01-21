import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        emailVerified: boolean;
        roles: UserRole[];
        isBanned: boolean;
      };
    }
  }
}

export {};

