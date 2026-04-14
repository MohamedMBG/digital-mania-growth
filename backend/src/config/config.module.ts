import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import appConfig from "./configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig],
      envFilePath: [".env", ".env.local"],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
        PORT: Joi.number().port().default(4000),
        API_PREFIX: Joi.string().default("api"),
        FRONTEND_URL: Joi.string().required(),
        TRUST_PROXY: Joi.string().valid("true", "false").optional(),
        DATABASE_URL: Joi.string().uri({ scheme: [/postgres(?:ql)?/] }).required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().port().default(6379),
        REDIS_USERNAME: Joi.string().allow("").optional(),
        REDIS_PASSWORD: Joi.string().allow("").optional(),
        REDIS_DB: Joi.number().integer().min(0).default(0),
        JWT_ACCESS_SECRET: Joi.string().min(24).required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default("15m"),
        JWT_REFRESH_SECRET: Joi.string().min(24).required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),
        JWT_REFRESH_COOKIE_NAME: Joi.string().default("nexora_refresh"),
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_WEBHOOK_SECRET: Joi.string().required(),
        STRIPE_CURRENCY: Joi.string().length(3).default("USD"),
        STRIPE_CHECKOUT_SUCCESS_URL: Joi.string().uri().required(),
        STRIPE_CHECKOUT_CANCEL_URL: Joi.string().uri().required(),
        PROVIDER_URL: Joi.string().uri().required(),
        PROVIDER_API_KEY: Joi.string().required(),
        LOG_LEVEL: Joi.string().valid("fatal", "error", "warn", "log", "debug", "verbose").default("debug"),
        BULLMQ_PREFIX: Joi.string().default("nexora"),
        CACHE_TTL_SECONDS: Joi.number().integer().min(10).default(120),
        ADMIN_BOOTSTRAP_EMAIL: Joi.string().email().optional(),
        ADMIN_BOOTSTRAP_PASSWORD: Joi.string().min(12).optional(),
        ADMIN_BOOTSTRAP_FULL_NAME: Joi.string().max(80).optional(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class AppConfigModule {}
