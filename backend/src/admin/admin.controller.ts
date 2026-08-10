import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAccessGuard } from "src/auth/guards/jwt-access.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";
import { AdminCreateProgressSnapshotDto } from "src/growth/dto/admin-create-progress-snapshot.dto";
import { AdminListGrowthRequestsQueryDto } from "src/growth/dto/admin-list-growth-requests-query.dto";
import { AdminUpdateGrowthRequestDto } from "src/growth/dto/admin-update-growth-request.dto";
import { AdminUpsertGrowthPlanDto } from "src/growth/dto/admin-upsert-growth-plan.dto";
import { GrowthService } from "src/growth/growth.service";
import { AdminService } from "./admin.service";
import { AdminCreateServiceDto } from "./dto/admin-create-service.dto";
import { AdminListQueryDto } from "./dto/admin-list-query.dto";
import { AdminUpdateOrderDto } from "./dto/admin-update-order.dto";
import { AdminUpdateServiceDto } from "./dto/admin-update-service.dto";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { AdminWalletAdjustmentDto } from "./dto/admin-wallet-adjustment.dto";

@Controller("admin")
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly growthService: GrowthService
  ) {}

  @Get("growth-requests")
  getGrowthRequests(@Query() query: AdminListGrowthRequestsQueryDto) {
    return this.growthService.adminListRequests(query);
  }

  @Get("growth-requests/:id")
  getGrowthRequest(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id") id: string
  ) {
    return this.growthService.getRequestById(actor, id);
  }

  @Patch("growth-requests/:id")
  updateGrowthRequest(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AdminUpdateGrowthRequestDto
  ) {
    return this.growthService.adminUpdateRequest(actor, id, dto);
  }

  @Put("growth-requests/:id/plan")
  upsertGrowthPlan(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AdminUpsertGrowthPlanDto
  ) {
    return this.growthService.adminUpsertPlan(actor, id, dto);
  }

  @Post("growth-requests/:id/progress")
  addGrowthProgress(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AdminCreateProgressSnapshotDto
  ) {
    return this.growthService.adminAddProgressSnapshot(actor, id, dto);
  }

  @Get("users")
  getUsers(@Query() query: AdminListQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Patch("users/:id")
  updateUser(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AdminUpdateUserDto
  ) {
    return this.adminService.updateUser(actor, id, dto);
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

  @Patch("orders/:id/cancel")
  cancelOrder(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id") id: string
  ) {
    return this.adminService.cancelOrder(actor, id);
  }

  @Post("wallet-adjustments")
  adjustWallet(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: AdminWalletAdjustmentDto
  ) {
    return this.adminService.adjustWallet(actor, dto);
  }
}
