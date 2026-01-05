/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Put,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { IdiomsService } from './idioms.service';
import { CreateIdiomDto, BulkCreateIdiomDto } from './dto/create-idiom.dto';
import { IdiomQueryDto, SearchLogQueryDto } from './dto/idiom-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

export type SearchMode = 'database' | 'ai';

@Controller('idioms')
export class IdiomsController {
  constructor(private readonly idiomsService: IdiomsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/stats')
  async getAdminStats() {
    return this.idiomsService.getAdminStats();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/search-logs')
  async getSearchLogs(@Query() query: SearchLogQueryDto) {
    return this.idiomsService.getSearchLogs(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/search-logs/:query')
  async deleteSearchLog(@Param('query') query: string) {
    return this.idiomsService.deleteSearchLog(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/search-logs/bulk-delete')
  async bulkDeleteSearchLogs(@Body() body: { queries: string[] }) {
    return this.idiomsService.bulkDeleteSearchLogs(body.queries);
  }

  @Get()
  async findAll(@Query() query: IdiomQueryDto) {
    return this.idiomsService.findAll(query);
  }

  @Get('suggestions')
  async getSuggestions(@Query() query: PaginationQueryDto) {
    return this.idiomsService.fetchSuggestions(query);
  }

  @Get('daily')
  async getDailySuggestions() {
    return this.idiomsService.getDailySuggestions();
  }

  @Get('search')
  async search(@Query('query') query: string, @Query('mode') mode: SearchMode) {
    return this.idiomsService.search(query, mode);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.idiomsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() createIdiomDto: CreateIdiomDto) {
    return this.idiomsService.create(createIdiomDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIdiomDto: CreateIdiomDto,
  ) {
    return this.idiomsService.update(id, updateIdiomDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.idiomsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('bulk-delete')
  async bulkDelete(@Body() body: { ids: string[] }) {
    return this.idiomsService.bulkDelete(body.ids);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('bulk')
  async bulkCreate(@Body() body: any) {
    const idioms = Array.isArray(body) ? body : body.idioms;
    if (!idioms || !Array.isArray(idioms)) {
      throw new BadRequestException('Dữ liệu không hợp lệ. Phải là một mảng.');
    }
    return this.idiomsService.bulkCreate(idioms);
  }
}
