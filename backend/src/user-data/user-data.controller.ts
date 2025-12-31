import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDataService } from './user-data.service';

@Controller('user-data')
@UseGuards(JwtAuthGuard)
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  @Post('saved/toggle')
  toggleSave(@Request() req, @Body('idiomId') idiomId: string) {
    return this.userDataService.toggleSaveIdiom(req.user.id, idiomId);
  }

  @Get('saved/check/:idiomId')
  checkSaved(@Request() req, @Param('idiomId') idiomId: string) {
    return this.userDataService.isSaved(req.user.id, idiomId);
  }

  @Get('saved')
  getSaved(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ) {
    return this.userDataService.getSavedIdioms(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }

  @Post('srs')
  updateSRS(@Request() req, @Body() body: any) {
    return this.userDataService.updateSRS(req.user.id, body.idiomId, body);
  }

  @Get('srs')
  getSRS(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.userDataService.getSRSData(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }

  @Post('history')
  addHistory(@Request() req, @Body('idiomId') idiomId: string) {
    return this.userDataService.addToHistory(req.user.id, idiomId);
  }

  @Get('history')
  getHistory(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.userDataService.getHistory(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }

  @Delete('history')
  clearHistory(@Request() req) {
    return this.userDataService.clearHistory(req.user.id);
  }
}
