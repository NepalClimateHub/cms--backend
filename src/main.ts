import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { VALIDATION_PIPE_OPTIONS } from "./shared/constants";
import { RequestIdMiddleware } from "./shared/middlewares/request-id/request-id.middleware";
import { apiReference } from "@scalar/nestjs-api-reference";

function updateReferences(
  obj: Record<string, any>,
  oldRef: string,
  newRef: string
): void {
  if (!obj || typeof obj !== "object") return;

  if (obj.$ref === oldRef) {
    obj.$ref = newRef;
  }

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
      updateReferences(obj[key], oldRef, newRef);
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.use(RequestIdMiddleware);
  app.enableCors();

  /** Swagger configuration */
  const options = new DocumentBuilder()
    .setTitle("NCH")
    .setDescription("NCH")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  if (document.components?.schemas) {
    const schemas = document.components.schemas;

    const problematicKeys = Object.keys(schemas).filter((key) => {
      return (
        key.includes("class ") ||
        key.includes("{") ||
        key.includes("\n") ||
        key.includes("SwaggerBaseApiResponseFor")
      );
    });

    problematicKeys.forEach((key) => {
      let modelName = "";
      if (key.includes("SwaggerBaseApiResponseFor")) {
        const match = key.match(/SwaggerBaseApiResponseFor\s+([a-zA-Z0-9_]+)/);
        if (match && match[1]) {
          modelName = `ApiResponseOf${match[1]}`;
        } else {
          modelName = `CleanApiResponse${Math.floor(Math.random() * 10000)}`;
        }
      } else if (key.includes("class ")) {
        const match = key.match(/class\s+([a-zA-Z0-9_]+)/);
        if (match && match[1]) {
          modelName = match[1];
        } else {
          modelName = `CleanApiResponse${Math.floor(Math.random() * 10000)}`;
        }
      } else {
        modelName = `CleanApiResponse${Math.floor(Math.random() * 10000)}`;
      }

      schemas[modelName] = schemas[key];

      const oldRef = `#/components/schemas/${key}`;
      const newRef = `#/components/schemas/${modelName}`;
      updateReferences(document, oldRef, newRef);

      delete schemas[key];
    });
  }

  const configService = app.get(ConfigService);

  if (configService.get<string>("APP_ENV") === "development") {
    app.use("/docs", apiReference({ content: document }));
    app.use("/swagger.json", (req: any, res: any) => {
      return res.json(document);
    });
  }

  const port = configService.get<number>("port") || 3000;
  await app.listen(port);
  Logger.log(`App port: ${port}`);
}
bootstrap();
