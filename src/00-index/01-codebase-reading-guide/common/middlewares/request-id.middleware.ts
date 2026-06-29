import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Mở rộng kiểu Request để thêm requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Ưu tiên lấy từ header client gửi lên (nếu có), nếu không thì tự tạo UUID
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();

    // Gắn vào request để các layer phía sau (Filter, Guard, Service...) dùng được
    req.requestId = requestId;

    // Gắn vào response header để client có thể trace lỗi
    res.setHeader('X-Request-Id', requestId);

    next();
  }
}
