import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { AdminBootstrapService } from "./admin-bootstrap.service";
import { UsersService } from "./users.service";

@Module({
  imports: [PrismaModule],
  providers: [UsersService, AdminBootstrapService],
  exports: [UsersService],
})
export class UsersModule {}
