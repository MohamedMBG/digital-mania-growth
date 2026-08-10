import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { WalletModule } from "src/wallet/wallet.module";
import { GrowthBotModule } from "src/growth-bot/growth-bot.module";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  imports: [PrismaModule, WalletModule, GrowthBotModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
