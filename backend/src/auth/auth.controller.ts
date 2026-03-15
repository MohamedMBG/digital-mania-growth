import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
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
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RateLimitGuard)
  @RateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "auth:register" })
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(RateLimitGuard)
  @RateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: "auth:login" })
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(RateLimitGuard)
  @RateLimit({ windowMs: 5 * 60 * 1000, maxRequests: 20, keyPrefix: "auth:refresh" })
  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAccessGuard)
  @Post("logout")
  logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtAccessGuard)
  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user);
  }
}
