import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { User } from "@prisma/client";
import { StringValue } from "ms";
import { UsersService } from "src/users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthenticatedUser } from "./types/authenticated-user.type";
import { JwtPayload } from "./types/jwt-payload.type";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.createUser({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
    });

    const tokens = await this.issueTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return this.buildAuthResponse(user, tokens);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user?.passwordHash || !user.isActive) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return this.buildAuthResponse(user, tokens);
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.refreshTokenHash || !user.isActive) {
      throw new UnauthorizedException("Refresh token is invalid or expired.");
    }

    const matches = await argon2.verify(user.refreshTokenHash, refreshToken);

    if (!matches) {
      throw new UnauthorizedException("Refresh token is invalid or expired.");
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return this.buildAuthResponse(user, tokens);
  }

  async logout(userId: string) {
    await this.usersService.setRefreshTokenHash(userId, null);

    return {
      success: true,
      message: "Logged out successfully.",
      data: null,
    };
  }

  async me(user: AuthenticatedUser) {
    const dbUser = await this.usersService.findById(user.id);

    if (!dbUser || !dbUser.isActive) {
      throw new UnauthorizedException("Your session is no longer valid.");
    }

    return {
      success: true,
      message: "Authenticated user loaded successfully.",
      data: {
        user: this.usersService.toPublicUser(dbUser),
      },
    };
  }

  private async issueTokens(user: User) {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    };

    const refreshPayload: JwtPayload = {
      ...accessPayload,
      type: "refresh",
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>("jwt.accessSecret"),
        expiresIn: this.getTokenExpiry("jwt.accessExpiresIn"),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>("jwt.refreshSecret"),
        expiresIn: this.getTokenExpiry("jwt.refreshExpiresIn"),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>("jwt.refreshSecret"),
      });

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Refresh token is invalid or expired.");
      }

      return payload;
    } catch {
      throw new UnauthorizedException("Refresh token is invalid or expired.");
    }
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.usersService.setRefreshTokenHash(userId, refreshTokenHash);
  }

  private getTokenExpiry(
    key: "jwt.accessExpiresIn" | "jwt.refreshExpiresIn"
  ): StringValue {
    return this.configService.getOrThrow<StringValue>(key);
  }

  private buildAuthResponse(
    user: User,
    tokens: { accessToken: string; refreshToken: string }
  ) {
    return {
      success: true,
      message: "Authentication successful.",
      data: {
        user: this.usersService.toPublicUser(user),
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenType: "Bearer",
          expiresIn: this.configService.getOrThrow<string>("jwt.accessExpiresIn"),
          refreshExpiresIn: this.configService.getOrThrow<string>("jwt.refreshExpiresIn"),
        },
      },
    };
  }
}
