import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as SecurityServiceNamespace from '../security/security.service';

@Injectable()
export class IpBlacklistGuard implements CanActivate {
  constructor(
    private securityService: SecurityServiceNamespace.SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const forwardedFor = request.headers['x-forwarded-for'];
    const ip =
      request.headers['cf-connecting-ip'] ||
      (Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor?.split(',')[0]) ||
      request.ip;

    const isBlocked = await this.securityService.isIpBlocked(
      String(ip || 'unknown'),
    );
    if (isBlocked) {
      throw new HttpException(
        'Truy cập của bạn bị tạm khóa do có dấu hiệu bất thường. Vui lòng thử lại sau.',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
