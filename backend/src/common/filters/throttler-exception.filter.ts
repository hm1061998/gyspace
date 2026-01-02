import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as SecurityServiceNamespace from '../security/security.service';

@Catch(HttpException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  constructor(
    private securityService: SecurityServiceNamespace.SecurityService,
  ) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      const forwardedFor = request.headers['x-forwarded-for'];
      const ip =
        request.headers['cf-connecting-ip'] ||
        (Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor?.split(',')[0]) ||
        request.ip;

      // Record violation and potentially block
      await this.securityService.recordViolation(String(ip || 'unknown'));
    }

    // Continue with default error response or customize it
    response.status(status).json(exception.getResponse());
  }
}
