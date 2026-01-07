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
import { UserDataQueryDto } from './dto/user-data-query.dto';
import { UpdateSRSDto } from './dto/user-data.dto';

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
  getSaved(@Request() req, @Query() query: UserDataQueryDto) {
    return this.userDataService.getSavedIdioms(req.user.id, query);
  }

  @Post('srs')
  updateSRS(@Request() req, @Body() body: UpdateSRSDto) {
    return this.userDataService.updateSRS(req.user.id, body.idiomId, body);
  }

  @Get('srs')
  getSRS(@Request() req, @Query() query: UserDataQueryDto) {
    return this.userDataService.getSRSData(req.user.id, query);
  }

  @Post('history')
  addHistory(@Request() req, @Body('idiomId') idiomId: string) {
    return this.userDataService.addToHistory(req.user.id, idiomId);
  }

  @Get('history')
  getHistory(@Request() req, @Query() query: UserDataQueryDto) {
    return this.userDataService.getHistory(req.user.id, query);
  }

  @Delete('history')
  clearHistory(@Request() req) {
    return this.userDataService.clearHistory(req.user.id);
  }

  @Post('saved/bulk-delete')
  bulkDeleteSaved(@Request() req, @Body('idiomIds') idiomIds: string[]) {
    return this.userDataService.bulkRemoveSaved(req.user.id, idiomIds);
  }

  @Post('history/bulk-delete')
  bulkDeleteHistory(@Request() req, @Body('idiomIds') idiomIds: string[]) {
    return this.userDataService.bulkRemoveHistory(req.user.id, idiomIds);
  }
}
