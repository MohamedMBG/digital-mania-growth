import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, User, UserRole } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { PublicUser } from "./users.types";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async createUser(data: {
    email: string;
    fullName?: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          fullName: data.fullName,
          passwordHash: data.passwordHash,
          role: data.role ?? UserRole.customer,
          provider: "email",
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("An account with this email already exists.");
      }

      throw error;
    }
  }

  async setRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
    await this.ensureExists(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      provider: user.provider,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async ensureExists(userId: string) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }
}
