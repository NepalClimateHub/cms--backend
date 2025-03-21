import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { VALIDATION_PIPE_OPTIONS } from "./shared/constants";
import { RequestIdMiddleware } from "./shared/middlewares/request-id/request-id.middleware";
import { apiReference } from "@scalar/nestjs-api-reference";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.use(RequestIdMiddleware);
  app.enableCors();

  /** Swagger configuration*/
  const options = new DocumentBuilder()
    .setTitle("NCH")
    .setDescription("NCH")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  app.use("/docs", apiReference({ content: document }));

  const configService = app.get(ConfigService);
  const port = configService.get<number>("port") || 3000;
  await app.listen(port);
  Logger.log(`App port: ${port}`);
}
bootstrap();
