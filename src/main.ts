import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Get the underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance();

  // Add health check endpoint using Express
  expressApp.get('/health', (req, res) => res.send('OK'));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
