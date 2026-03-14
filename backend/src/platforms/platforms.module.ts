import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { PlatformsController } from "./platforms.controller";
import { PlatformsService } from "./platforms.service";

@Module({
  imports: [PrismaModule],
  controllers: [PlatformsController],
  providers: [PlatformsService],
  exports: [PlatformsService],
})
export class PlatformsModule {}
