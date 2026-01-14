import {
  Controller,
  Put,
  Body,
  UseGuards,
  Req,
  Get,
  Post,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UpdateProfileDto, ChangePasswordDto } from './dto/user.dto';

import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    return this.userService.findOne(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() body: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, body);
  }

  @Put('change-password')
  async changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    return this.userService.changePassword(req.user.id, body);
  }

  // --- Admin Endpoints ---

  @Get('list')
  @UseGuards(AdminGuard)
  async listUsers(@Query() query: PaginationQueryDto) {
    return this.userService.findAll({
      page: Number(query.page || 1),
      limit: Number(query.limit || 10),
      search: query.search,
    });
  }

  @Post('admin-create')
  @UseGuards(AdminGuard)
  async adminCreateUser(
    @Body()
    body: {
      username: string;
      pass: string;
      isAdmin?: boolean;
      displayName?: string;
    },
  ) {
    return this.userService.createUser(body);
  }

  @Put(':id/reset-password')
  @UseGuards(AdminGuard)
  async resetPassword(
    @Param('id') id: string,
    @Body() body: { newPass: string },
  ) {
    return this.userService.resetPassword(id, body.newPass);
  }

  @Post(':id/revoke-session')
  @UseGuards(AdminGuard)
  async revokeSession(@Param('id') id: string) {
    return this.userService.revokeRefreshToken(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteUser(@Req() req, @Param('id') id: string) {
    return this.userService.deleteUser(id, req.user.id);
  }
}
