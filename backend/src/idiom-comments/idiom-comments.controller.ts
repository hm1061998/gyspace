import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IdiomCommentsService } from './idiom-comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  CreateCommentDto,
  UpdateCommentStatusDto,
  CommentQueryDto,
} from './dto/idiom-comment.dto';

@Controller('idiom-comments')
export class IdiomCommentsController {
  constructor(private readonly commentsService: IdiomCommentsService) {}

  // Public endpoint - Lấy comments đã được duyệt của một thành ngữ
  @Get('idiom/:idiomId')
  async getCommentsByIdiom(
    @Param('idiomId') idiomId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.commentsService.findByIdiom(
      idiomId,
      Number(page),
      Number(limit),
      sort,
      order,
    );
  }

  // User endpoint - Tạo comment mới (cần đăng nhập)
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    return this.commentsService.create(createCommentDto, req.user.id);
  }

  // User endpoint - Like comment
  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async likeComment(@Param('id') id: string, @Req() req) {
    return this.commentsService.like(id, req.user.id);
  }

  // User endpoint - Report comment
  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async reportComment(@Param('id') id: string) {
    return this.commentsService.report(id);
  }

  // Admin endpoint - Lấy tất cả comments với filter
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllComments(@Query() query: CommentQueryDto, @Req() req) {
    return this.commentsService.findAll(query);
  }

  // Admin endpoint - Lấy thống kê
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getStats(@Req() req) {
    return this.commentsService.getStats();
  }

  // Admin endpoint - Cập nhật trạng thái comment
  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async updateCommentStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCommentStatusDto,
    @Req() req,
  ) {
    return this.commentsService.updateStatus(id, updateStatusDto, req.user.id);
  }

  // Admin endpoint - Xóa comment
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async deleteComment(@Param('id') id: string, @Req() req) {
    return this.commentsService.delete(id, req.user.id);
  }
}
