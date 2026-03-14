import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { AppLogger } from "./common/logger/app-logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  const config = app.get(ConfigService);
  const port = config.get<number>("app.port", 4000);
  const apiPrefix = config.get<string>("app.apiPrefix", "api");
  const frontendUrl = config.get<string>("app.frontendUrl", "http://localhost:8080");

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: frontendUrl.split(",").map((value) => value.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  await app.listen(port);
  logger.log(`Backend running on http://localhost:${port}/${apiPrefix}`, "Bootstrap");
}

void bootstrap();
