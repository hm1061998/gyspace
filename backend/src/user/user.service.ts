import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { comparePasswords, hashPassword } from '../auth/utils/crypto.utils';
import { createPaginatedResponse } from '../common/utils/pagination.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user)
      throw new HttpException(
        'Người dùng không tồn tại',
        HttpStatus.BAD_REQUEST,
      );
    return user;
  }

  async findAll(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options;
    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.displayName',
        'user.isAdmin',
        'user.createdAt',
      ])
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      query.where(
        'user.username ILIKE :search OR user.displayName ILIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return createPaginatedResponse(data, total, page, limit);
  }

  async createUser(data: {
    username: string;
    pass: string;
    isAdmin?: boolean;
    displayName?: string;
  }) {
    const existing = await this.userRepository.findOne({
      where: { username: data.username },
    });
    if (existing) throw new BadRequestException('Tên đăng nhập đã tồn tại');

    const hashedPassword = await hashPassword(data.pass);
    const user = this.userRepository.create({
      username: data.username,
      password: hashedPassword,
      isAdmin: data.isAdmin || false,
      displayName: data.displayName,
    });

    return this.userRepository.save(user);
  }

  async resetPassword(id: string, newPass: string) {
    if (newPass.length < 6) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    const hashedPassword = await hashPassword(newPass);
    await this.userRepository.update(id, { password: hashedPassword });
    return { message: 'Đã reset mật khẩu thành công' };
  }

  async revokeRefreshToken(id: string) {
    await this.userRepository.update(id, { refreshToken: null });
    return { message: 'Đã xóa phiên đăng nhập thành công' };
  }

  async deleteUser(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new BadRequestException(
        'Bạn không thể tự xóa tài khoản của chính mình',
      );
    }

    const user = await this.findOne(id);

    if (user.isAdmin) {
      const adminCount = await this.userRepository.count({
        where: { isAdmin: true },
      });
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Bảo vệ hệ thống: Không thể xóa quản trị viên duy nhất',
        );
      }
    }

    await this.userRepository.delete(id);
    return { message: 'Đã xóa người dùng thành công' };
  }

  async updateProfile(id: string, updateData: { displayName?: string }) {
    await this.userRepository.update(id, {
      displayName: updateData.displayName,
    });
    return this.findOne(id);
  }

  async changePassword(
    id: string,
    passData: { oldPass: string; newPass: string },
  ) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });

    if (!user)
      throw new HttpException(
        'Người dùng không tồn tại',
        HttpStatus.BAD_REQUEST,
      );

    const isMatch = await comparePasswords(passData.oldPass, user.password);
    if (!isMatch) throw new BadRequestException('Mật khẩu cũ không chính xác');

    if (passData.newPass.length < 6) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const hashedNewPass = await hashPassword(passData.newPass);
    await this.userRepository.update(id, { password: hashedNewPass });

    return { message: 'Đổi mật khẩu thành công' };
  }
}
