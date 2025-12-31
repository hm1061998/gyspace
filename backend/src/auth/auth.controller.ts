import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.login(body.username, body.pass);
    this.setCookies(response, data.accessToken, data.refreshToken);
    return { user: data.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.refresh;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    try {
      const payload = await this.authService.verifyRefreshToken(refreshToken);
      const tokens = await this.authService.refreshTokens(
        payload.sub,
        refreshToken,
      );
      this.setCookies(response, tokens.accessToken, tokens.refreshToken);
      return { success: true };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(req.user.id);
    response.clearCookie('session', { path: '/' });
    response.clearCookie('refresh', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  private setCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';

    response.cookie('session', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refresh', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth/refresh', // Restricted path for security
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.username, body.pass);
  }
}
