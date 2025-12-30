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
} from '@nestjs/common';
import { IdiomsService } from './idioms.service';
import { CreateIdiomDto } from './dto/create-idiom.dto';

export type SearchMode = 'database' | 'ai';

@Controller('idioms')
export class IdiomsController {
  constructor(private readonly idiomsService: IdiomsService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
    @Query('filter') filter: string = '',
  ) {
    return this.idiomsService.findAll(Number(page), Number(limit), filter);
  }

  @Get('search')
  async search(@Query('query') query: string, @Query('mode') mode: SearchMode) {
    return this.idiomsService.search(query, mode);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.idiomsService.findById(id);
  }

  @Post()
  async create(@Body() createIdiomDto: CreateIdiomDto) {
    return this.idiomsService.create(createIdiomDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIdiomDto: CreateIdiomDto,
  ) {
    return this.idiomsService.update(id, updateIdiomDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.idiomsService.remove(id);
  }

  @Post('bulk')
  async bulkCreate(@Body() idioms: CreateIdiomDto[]) {
    return this.idiomsService.bulkCreate(idioms);
  }
}
