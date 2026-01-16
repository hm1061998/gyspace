import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IdiomCommentEntity,
  CommentStatus,
} from './entities/idiom-comment.entity';
import { IdiomEntity } from '../idioms/entities/idiom.entity';
import { UserEntity } from '../user/entities/user.entity';
import {
  CreateCommentDto,
  UpdateCommentStatusDto,
  CommentQueryDto,
} from './dto/idiom-comment.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse } from '../common/utils/pagination.util';

@Injectable()
export class IdiomCommentsService {
  constructor(
    @InjectRepository(IdiomCommentEntity)
    private commentRepository: Repository<IdiomCommentEntity>,
    @InjectRepository(IdiomEntity)
    private idiomRepository: Repository<IdiomEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const idiom = await this.idiomRepository.findOne({
      where: { id: createCommentDto.idiomId },
    });

    if (!idiom) {
      throw new HttpException(
        'Không tìm thấy thành ngữ',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(
        'Không tìm thấy người dùng',
        HttpStatus.BAD_REQUEST,
      );
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      user: user,
      idiom: idiom,
      status: CommentStatus.PENDING,
    });

    return await this.commentRepository.save(comment);
  }

  async findByIdiom(idiomId: string, query: PaginationQueryDto) {
    const { page = 1, limit = 10, sort = 'createdAt,DESC' } = query;
    const skip = (page - 1) * limit;

    const [sortField, sortOrder] = sort.split(',');
    const order = (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';

    const [data, total] = await this.commentRepository.findAndCount({
      where: {
        idiom: { id: idiomId },
        status: CommentStatus.APPROVED,
      },
      order: { [sortField]: order },
      relations: ['user'],
      take: limit,
      skip: skip,
    });

    return createPaginatedResponse(data, total, page, limit);
  }

  async findAll(query: CommentQueryDto) {
    let {
      status,
      idiomId,
      userId,
      search,
      onlyReported,
      page = 1,
      limit = 20,
      filter,
    } = query;

    if (filter && typeof filter === 'string' && filter.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(filter);
        status = parsed.status || status;
        idiomId = parsed.idiomId || idiomId;
        userId = parsed.userId || userId;
        search = parsed.search || search;
        onlyReported =
          parsed.onlyReported !== undefined
            ? parsed.onlyReported
            : onlyReported;
      } catch (e) {
        // Fallback
      }
    }

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.idiom', 'idiom');

    if (status) {
      queryBuilder.andWhere('comment.status = :status', { status });
    }

    if (idiomId) {
      queryBuilder.andWhere('comment.idiom.id = :idiomId', { idiomId });
    }

    if (userId) {
      queryBuilder.andWhere('comment.user.id = :userId', { userId });
    }

    if (onlyReported) {
      queryBuilder.andWhere('comment.reportCount > 0');
    }

    if (search) {
      queryBuilder.andWhere(
        '(comment.content ILike :search OR user.displayName ILike :search OR idiom.hanzi ILike :search)',
        { search: `%${search}%` },
      );
    }

    const [sortField, sortOrder] = (query.sort || 'createdAt,DESC').split(',');
    const order = (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';

    queryBuilder
      .orderBy(`comment.${sortField}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [comments, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(comments, total, page, limit);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateCommentStatusDto,
    adminId: string,
  ) {
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || !admin.isAdmin) {
      throw new ForbiddenException('Chỉ admin mới có quyền thực hiện');
    }

    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new HttpException(
        'Không tìm thấy bình luận',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!comment.processedAt) {
      comment.processedAt = new Date();
    }

    comment.status = updateStatusDto.status;
    return await this.commentRepository.save(comment);
  }

  async like(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new HttpException(
        'Không tìm thấy bình luận',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Note: Trong production, nên tạo bảng riêng để track user đã like
    // Hiện tại chỉ tăng số lượng like
    comment.likes += 1;
    return await this.commentRepository.save(comment);
  }

  async report(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new HttpException(
        'Không tìm thấy bình luận',
        HttpStatus.BAD_REQUEST,
      );
    }

    comment.reportCount += 1;

    // Tự động reject nếu bị report quá 5 lần
    if (comment.reportCount >= 5) {
      comment.status = CommentStatus.REJECTED;
    }

    return await this.commentRepository.save(comment);
  }

  async delete(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new HttpException(
        'Không tìm thấy bình luận',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.commentRepository.remove(comment);
    return { message: 'Đã xóa bình luận thành công' };
  }

  async bulkDelete(ids: string[], userId: string) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Danh sách trống');
    }

    await this.commentRepository.delete(ids);
    return { success: true, deleted: ids.length };
  }

  async getStats() {
    // 1. Lấy thống kê số lượng theo status trong 1 query duy nhất
    const statusResults = await this.commentRepository
      .createQueryBuilder('comment')
      .select('comment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('comment.status')
      .getRawMany();

    const statsMap = statusResults.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});

    const pending = statsMap[CommentStatus.PENDING] || 0;
    const approved = statsMap[CommentStatus.APPROVED] || 0;
    const rejected = statsMap[CommentStatus.REJECTED] || 0;
    const total = pending + approved + rejected;

    // 2. Top thành ngữ bị report nhiều nhất (Đã tối ưu QueryBuilder)
    const topReported = await this.commentRepository
      .createQueryBuilder('comment')
      .innerJoin('comment.idiom', 'idiom')
      .select([
        'idiom.id AS id',
        'idiom.hanzi AS hanzi',
        'idiom.pinyin AS pinyin',
        'SUM(comment.reportCount) AS totalreports',
      ])
      .groupBy('idiom.id, idiom.hanzi, idiom.pinyin')
      .having('SUM(comment.reportCount) > 0')
      .orderBy('totalreports', 'DESC')
      .take(5)
      .getRawMany();

    return {
      total,
      pending,
      approved,
      rejected,
      topReported,
    };
  }
}
