import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { GrowthBotModule } from "src/growth-bot/growth-bot.module";
import { GrowthController } from "./growth.controller";
import { GrowthService } from "./growth.service";

@Module({
  imports: [PrismaModule, GrowthBotModule],
  controllers: [GrowthController],
  providers: [GrowthService],
  exports: [GrowthService],
})
export class GrowthModule {}
