// dotenv is a dev dependency, so conditionally import it (don't need it in Prod).
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
} catch {
  // Pass
}
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { json } from 'express';
import { WinstonModule } from 'nest-winston';
import { instance } from './logger/winston.logger';
import { logger } from './middleware/logger.middleware';
import { AppModule } from './modules/app.module';
import { CustomExceptionFilter } from './utilities/custom-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // In local development use the built in logger for better readability
    logger:
      process.env.NODE_ENV === 'development'
        ? ['log']
        : WinstonModule.createLogger({
          instance: instance,
        }),
  });
  const allowList = process.env.CORS_ORIGINS || [];
  const allowListRegex = process.env.CORS_REGEX
    ? JSON.parse(process.env.CORS_REGEX)
    : [];
  const regexAllowList = allowListRegex.map((regex) => {
    return new RegExp(regex);
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  const inUselogger: Logger = app.get(Logger);
  app.useGlobalFilters(new CustomExceptionFilter(httpAdapter, inUselogger));
  app.enableCors((req, cb) => {
    const options = {
      credentials: true,
      origin: false,
    };

    const origin = req.header('Origin');
    const appUrl = req.header('appurl'); // Service Connect may strip Origin, check appurl
    inUselogger.debug(`AppUrl: ${appUrl}, Origin: ${origin}`);
    inUselogger.debug(`Allow List: ${allowList}`);

    if (
      process.env.DISABLE_CORS === 'TRUE' ||
      (origin && (allowList.indexOf(origin) !== -1 || regexAllowList.some((regex) => regex.test(origin)))) ||
      (appUrl && (allowList.indexOf(appUrl) !== -1 || regexAllowList.some((regex) => regex.test(appUrl))))
    ) {
      inUselogger.debug(`CORS enabled for origin: ${origin || appUrl}`);
      options.origin = true;
    }
    cb(null, options);
  });
  // Debug middleware to capture headers (only when DEBUG_HEADERS=true)
  if (process.env.DEBUG_HEADERS === 'true') {
    app.use((req, res, next) => {
      inUselogger.debug('=== RAW REQUEST DEBUG ===');
      inUselogger.debug(`Method: ${req.method}`);
      inUselogger.debug(`URL: ${req.url}`);
      inUselogger.debug(`Origin: ${req.headers.origin}`);
      inUselogger.debug(`Host: ${req.headers.host}`);
      inUselogger.debug(`All Headers: ${JSON.stringify(req.headers, null, 2)}`);
      inUselogger.debug('========================');
      next();
    });
  }
  app.use(logger);
  app.use(
    cookieParser(),
    compression({
      filter: (_, res) => {
        return res.req.route?.path === '/applications/csv';
      },
    }),
  );
  app.use(json({ limit: '50mb' }));
  const config = new DocumentBuilder()
    .setTitle('Bloom API')
    .setDescription('The API for Bloom')
    .setVersion('2.0')
    .addTag('listings')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Add passkey as an optional header to all endpoints
  Object.values(document.paths).forEach((path) => {
    Object.values(path).forEach((method) => {
      method.parameters = [
        ...(method.parameters || []),
        {
          in: 'header',
          name: 'passkey',
          description: 'Pass key',
          required: false,
        },
      ];
    });
  });
  SwaggerModule.setup('api', app, document);
  const configService: ConfigService = app.get(ConfigService);

  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
