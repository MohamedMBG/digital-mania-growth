import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAccessGuard } from "src/auth/guards/jwt-access.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { AdminService } from "./admin.service";
import { AdminCreateServiceDto } from "./dto/admin-create-service.dto";
import { AdminListQueryDto } from "./dto/admin-list-query.dto";
import { AdminUpdateOrderDto } from "./dto/admin-update-order.dto";
import { AdminUpdateServiceDto } from "./dto/admin-update-service.dto";
import { AdminWalletAdjustmentDto } from "./dto/admin-wallet-adjustment.dto";

@Controller("admin")
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  getUsers(@Query() query: AdminListQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get("orders")
  getOrders(@Query() query: AdminListQueryDto) {
    return this.adminService.getOrders(query);
  }

  @Get("payments")
  getPayments(@Query() query: AdminListQueryDto) {
    return this.adminService.getPayments(query);
  }

  @Post("services")
  createService(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: AdminCreateServiceDto
  ) {
    return this.adminService.createService(actor, dto);
  }

  @Patch("services/:id")
  updateService(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AdminUpdateServiceDto
  ) {
    return this.adminService.updateService(actor, id, dto);
  }

  @Post("providers/sync-services")
  syncProviderServices(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminService.syncProviderServices(actor);
  }

  @Get("providers/balance")
  getProviderBalance(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminService.getProviderBalance(actor);
  }

  @Patch("orders/:id")
  updateOrder(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AdminUpdateOrderDto
  ) {
    return this.adminService.updateOrder(actor, id, dto);
  }

  @Post("wallet-adjustments")
  adjustWallet(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: AdminWalletAdjustmentDto
  ) {
    return this.adminService.adjustWallet(actor, dto);
  }
}
