import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { username: string; pass: string }) {
    return this.authService.login(body.username, body.pass);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: { username: string; pass: string }) {
    return this.authService.register(body.username, body.pass);
  }
}
