import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  if (process.env.NODE_ENV !== 'production') {
    app.use(
      // ❗ CHỈ proxy các path KHÔNG bắt đầu bằng /api
      createProxyMiddleware({
        target: 'http://localhost:5173',
        changeOrigin: true,
        ws: true,
        pathFilter: (path) => !path.startsWith('/api'),
      }),
    );
  }
  // Cấu hình CORS mở rộng để tránh lỗi chặn truy cập từ Frontend
  app.enableCors({
    origin: true, // Cho phép tất cả các nguồn (hoặc điền ['http://localhost:5173'] nếu muốn cụ thể)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
