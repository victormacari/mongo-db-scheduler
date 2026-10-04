import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as qs from 'qs'

import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { BadRequestException, Logger, ValidationPipe, VersioningType } from '@nestjs/common';
const port: string = process.env.PORT || '3002';
async function bootstrap() {
  try {
    const fastifyAdapter: FastifyAdapter = new FastifyAdapter({
      logger: false,
      maxParamLength: 255,
      querystringParser: (str) =>
        qs.parse(str, {
          comma: true,
          depth: 10,
        }),
    });
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter);

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: false,
      exceptionFactory: (errors) => new BadRequestException(errors)
    }
    )
    );

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1'
    });
    await app.listen(port, '0.0.0.0', () => Logger.log(`Server is listening on ${port}`));
  } catch (err: any) {
       Logger.error(err.message, err.stack);
       process.exit(1);
  }

}
bootstrap();
