import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Check if ID already exists (from proxy or client)
    const requestId = req.headers['x-request-id'] || randomUUID();

    // Attach to request object for easy access
    req['requestId'] = requestId;

    // Set in response header so client can also trace it
    res.setHeader('x-request-id', requestId);

    next();
  }
}
