import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { UserRole } from "@prisma/client";
import { AppLogger } from "src/common/logger/app-logger.service";
import { UsersService } from "./users.service";

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly logger: AppLogger
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string | undefined>("adminBootstrap.email");

    if (!email) {
      return;
    }

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      if (existingUser.role !== UserRole.admin) {
        await this.usersService.updateAdminManagedUser(existingUser.id, {
          role: UserRole.admin,
          isActive: true,
        });
        this.logger.warn(
          `Promoted ${email} to admin through bootstrap configuration.`,
          "AdminBootstrapService"
        );
      }

      return;
    }

    const password = this.configService.get<string | undefined>("adminBootstrap.password");

    if (!password) {
      this.logger.warn(
        `ADMIN_BOOTSTRAP_EMAIL is set for ${email}, but no ADMIN_BOOTSTRAP_PASSWORD was provided.`,
        "AdminBootstrapService"
      );
      return;
    }

    const passwordHash = await argon2.hash(password);
    const fullName =
      this.configService.get<string>("adminBootstrap.fullName") ?? "Platform Admin";

    await this.usersService.createUser({
      email,
      fullName,
      passwordHash,
      role: UserRole.admin,
    });

    this.logger.warn(
      `Created bootstrap admin account for ${email}. Rotate bootstrap credentials after first login.`,
      "AdminBootstrapService"
    );
  }
}
