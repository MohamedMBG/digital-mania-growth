import { Module } from "@nestjs/common";
import { OrdersModule } from "src/orders/orders.module";
import { ProviderModule } from "src/provider/provider.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { UsersModule } from "src/users/users.module";
import { WalletModule } from "src/wallet/wallet.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [PrismaModule, ProviderModule, WalletModule, OrdersModule, UsersModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
