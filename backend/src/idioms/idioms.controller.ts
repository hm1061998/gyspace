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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export type SearchMode = 'database' | 'ai';

@Controller('idioms')
export class IdiomsController {
  constructor(private readonly idiomsService: IdiomsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  async getAdminStats() {
    return this.idiomsService.getAdminStats();
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
    @Query('filter') filter: string = '',
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.idiomsService.findAll(
      Number(page),
      Number(limit),
      filter,
      sort,
      order,
    );
  }

  @Get('search')
  async search(@Query('query') query: string, @Query('mode') mode: SearchMode) {
    return this.idiomsService.search(query, mode);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.idiomsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createIdiomDto: CreateIdiomDto) {
    return this.idiomsService.create(createIdiomDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIdiomDto: CreateIdiomDto,
  ) {
    return this.idiomsService.update(id, updateIdiomDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.idiomsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  async bulkCreate(@Body() body: any) {
    const idioms = Array.isArray(body) ? body : body.idioms;
    if (!idioms || !Array.isArray(idioms)) {
      throw new BadRequestException('Dữ liệu không hợp lệ. Phải là một mảng.');
    }
    return this.idiomsService.bulkCreate(idioms);
  }
}
