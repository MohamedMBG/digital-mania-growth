import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { JwtAccessGuard } from "src/auth/guards/jwt-access.guard";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { WalletTransactionsQueryDto } from "./dto/wallet-transactions-query.dto";
import { WalletService } from "./wallet.service";

@Controller("wallet")
@UseGuards(JwtAccessGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser() user: AuthenticatedUser) {
    return this.walletService.getWallet(user.id);
  }

  @Get("transactions")
  getTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: WalletTransactionsQueryDto
  ) {
    return this.walletService.getTransactions(user.id, query);
  }
}
