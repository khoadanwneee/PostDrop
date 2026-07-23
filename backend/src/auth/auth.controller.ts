import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@supabase/supabase-js';
import { Request, Response } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthResult, AuthService } from './auth.service';
import { CurrentAuth } from './current-auth.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const REFRESH_TOKEN_COOKIE = 'postdrop_refresh_token';
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

interface CurrentAuthValue {
  accessToken: string;
  user: User;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(dto);
    return this.sendSession(response, result);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);
    return this.sendSession(response, result);
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refresh(
      this.getRefreshToken(request),
    );
    return this.sendSession(response, result);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @CurrentAuth() auth: CurrentAuthValue,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(
      auth.accessToken,
      this.getRefreshToken(request),
    );
    response.clearCookie(REFRESH_TOKEN_COOKIE, this.cookieOptions());
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  me(@CurrentAuth() auth: CurrentAuthValue) {
    return auth.user;
  }

  private sendSession(response: Response, result: AuthResult) {
    if (result.refreshToken) {
      response.cookie(
        REFRESH_TOKEN_COOKIE,
        result.refreshToken,
        this.cookieOptions(REFRESH_TOKEN_MAX_AGE_MS),
      );
    }

    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresAt: result.expiresAt,
      ...(result.emailConfirmationRequired === undefined
        ? {}
        : { emailConfirmationRequired: result.emailConfirmationRequired }),
    };
  }

  private getRefreshToken(request: Request): string {
    const cookiePrefix = `${REFRESH_TOKEN_COOKIE}=`;
    const encodedToken = (request.headers.cookie ?? '')
      .split(';')
      .map((value) => value.trim())
      .find((value) => value.startsWith(cookiePrefix))
      ?.slice(cookiePrefix.length);
    const refreshToken = encodedToken
      ? decodeURIComponent(encodedToken)
      : undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('The refresh-token cookie is missing');
    }

    return refreshToken;
  }

  private cookieOptions(maxAge?: number) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/api/auth',
      ...(maxAge === undefined ? {} : { maxAge }),
    };
  }
}
