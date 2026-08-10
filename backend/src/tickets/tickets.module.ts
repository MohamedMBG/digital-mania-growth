import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { GrowthBotModule } from "src/growth-bot/growth-bot.module";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";

@Module({
  imports: [PrismaModule, GrowthBotModule],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
