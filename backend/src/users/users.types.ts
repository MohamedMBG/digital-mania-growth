import { UserRole } from "@prisma/client";

export type PublicUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  provider: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
