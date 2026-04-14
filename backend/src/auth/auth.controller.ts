import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAccessGuard } from "./guards/jwt-access.guard";
import { AuthenticatedUser } from "./types/authenticated-user.type";
import { RateLimitGuard } from "src/common/guards/rate-limit.guard";
import { RateLimit } from "src/common/rate-limit/rate-limit.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @UseGuards(RateLimitGuard)
  @RateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "auth:register" })
  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(response, result.refreshToken);
    return result.response;
  }

  @UseGuards(RateLimitGuard)
  @RateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: "auth:login" })
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(response, result.refreshToken);
    return result.response;
  }

  @UseGuards(RateLimitGuard)
  @RateLimit({ windowMs: 5 * 60 * 1000, maxRequests: 20, keyPrefix: "auth:refresh" })
  @Post("refresh")
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = dto.refreshToken ?? this.extractRefreshTokenFromCookie(request);
    const result = await this.authService.refresh(refreshToken);
    this.setRefreshCookie(response, result.refreshToken);
    return result.response;
  }

  @UseGuards(JwtAccessGuard)
  @Post("logout")
  logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response
  ) {
    this.clearRefreshCookie(response);
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtAccessGuard)
  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user);
  }

  private setRefreshCookie(response: Response, refreshToken: string) {
    const nodeEnv = this.configService.get<string>("app.nodeEnv");
    const cookieName =
      this.configService.get<string>("jwt.refreshCookieName") ?? "nexora_refresh";
    const refreshTokenMaxAgeMs = this.getDurationMs(
      this.configService.get<string>("jwt.refreshExpiresIn") ?? "7d"
    );

    response.cookie(cookieName, refreshToken, {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: "lax",
      path: "/",
      ...(refreshTokenMaxAgeMs ? { maxAge: refreshTokenMaxAgeMs } : {}),
    });
  }

  private clearRefreshCookie(response: Response) {
    const nodeEnv = this.configService.get<string>("app.nodeEnv");
    const cookieName =
      this.configService.get<string>("jwt.refreshCookieName") ?? "nexora_refresh";

    response.clearCookie(cookieName, {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  private extractRefreshTokenFromCookie(request: Request) {
    const cookieName =
      this.configService.get<string>("jwt.refreshCookieName") ?? "nexora_refresh";
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return "";
    }

    const cookies = cookieHeader.split(";").map((part) => part.trim());
    const rawCookie = cookies.find((part) => part.startsWith(`${cookieName}=`));

    if (!rawCookie) {
      return "";
    }

    return decodeURIComponent(rawCookie.slice(cookieName.length + 1));
  }

  private getDurationMs(value: string) {
    const match = value.trim().match(/^(\d+)([smhd])$/i);

    if (!match) {
      return undefined;
    }

    const amount = Number.parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const multiplier =
      unit === "s"
        ? 1000
        : unit === "m"
          ? 60_000
          : unit === "h"
            ? 3_600_000
            : 86_400_000;

    return amount * multiplier;
  }
}
