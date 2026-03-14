import { Module } from "@nestjs/common";
import { ProviderModule } from "src/provider/provider.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { WalletModule } from "src/wallet/wallet.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [PrismaModule, ProviderModule, WalletModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
