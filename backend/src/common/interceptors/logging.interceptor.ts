import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('LoggingInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId = request['requestId'] || 'N/A';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        // Skip logging for health checks
        if (url.includes('/health')) {
          return;
        }

        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const delay = Date.now() - now;

        this.logger.debug(
          `[${requestId}] ${method} ${url} ${statusCode} - ${delay}ms`,
        );
      }),
    );
  }
}
