import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // app.use(
  //   '/api/devices',
  //   (req, res, next) => {
  //     console.log(' DEVICE PROXY ÇALIŞTI');
  //     console.log('method:', req.method);
  //     console.log('url:', req.url);
  //     console.log('originalUrl:', req.originalUrl);
  //     next();
  //   },
  //   createProxyMiddleware({
  //     target: 'http://localhost:3000',
  //     changeOrigin: true,
  //   }),
  // );
  app.use(
    '/api/devices',
    createProxyMiddleware({
      target: process.env.DEVICE_SERVICE_URL || 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: (path) => {
        // path = '/' ise '/devices', path = '/123' ise '/devices/123' yapar
        return `/devices${path === '/' ? '' : path}`;
      },
    }),
  );

  app.use(
    '/api/telemetry',
    createProxyMiddleware({
      target: process.env.TELEMETRY_SERVICE_URL || 'http://localhost:3007',
      changeOrigin: true,
      pathRewrite: (path) => {
        // path = '/' ise '/devices', path = '/123' ise '/devices/123' yapar
        return `/telemetry${path === '/' ? '' : path}`;
      },
    }),
  );

  app.use(
    '/api/alarms',
    createProxyMiddleware({
      target: process.env.ALARM_SERVICE_URL || 'http://localhost:3004',
      changeOrigin: true,
      pathRewrite: (path) => {
        // path = '/' ise '/devices', path = '/123' ise '/devices/123' yapar
        return `/alarms${path === '/' ? '' : path}`;
      },
    }),
  );

  app.use(
    '/api/alarm-rules',
    createProxyMiddleware({
      target: process.env.ALARM_SERVICE_URL || 'http://localhost:3004',
      changeOrigin: true,
      pathRewrite: (path) => {
        // path = '/' ise '/devices', path = '/123' ise '/devices/123' yapar
        return `/alarm-rules${path === '/' ? '' : path}`;
      },
    }),
  );

  app.use(
    '/api/notifications',
    createProxyMiddleware({
      target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
      changeOrigin: true,
      pathRewrite: (path) => {
        // path = '/' ise '/devices', path = '/123' ise '/devices/123' yapar
        return `/notifications${path === '/' ? '' : path}`;
      },
    }),
  );

  const port = process.env.PORT || 3010;
  await app.listen(process.env.PORT ?? 3010);
  console.log(`API Gateway çalışıyor: http://localhost:${port}`);
}
bootstrap();
