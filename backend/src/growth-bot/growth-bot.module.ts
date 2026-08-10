import { Module } from "@nestjs/common";
import { OrdersModule } from "src/orders/orders.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { WalletModule } from "src/wallet/wallet.module";
import { GrowthBotService } from "./growth-bot.service";

@Module({
  imports: [PrismaModule, OrdersModule, WalletModule],
  providers: [GrowthBotService],
  exports: [GrowthBotService],
})
export class GrowthBotModule {}
