import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './AppModule';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.use(helmet());
    app.useBodyParser('json', { limit: '10mb' });
    app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });
    app.setGlobalPrefix('api/v1/backend-challenge');
    app.enableCors({
        origin: '*',
    });
    const config = new DocumentBuilder()
        .setTitle('Backend Challenge API')
        .setDescription('API documentation for the backend challenge')
        .setVersion('1.0')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
    await app.listen(configService.get<string>('PORT') || 33000);
}
bootstrap();
