import { Controller, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto, ChangePasswordDto } from './dto/user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('profile')
  async updateProfile(@Req() req, @Body() body: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, body);
  }

  @Put('change-password')
  async changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    return this.userService.changePassword(req.user.id, body);
  }
}
