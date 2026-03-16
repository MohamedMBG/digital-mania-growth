export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 4000),
    apiPrefix: process.env.API_PREFIX ?? "api",
    frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:8080",
    logLevel: process.env.LOG_LEVEL ?? "debug",
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT ?? 6379),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB ?? 0),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: (process.env.STRIPE_CURRENCY ?? "USD").toLowerCase(),
    checkoutSuccessUrl:
      process.env.STRIPE_CHECKOUT_SUCCESS_URL ?? "http://localhost:8080/wallet/success",
    checkoutCancelUrl:
      process.env.STRIPE_CHECKOUT_CANCEL_URL ?? "http://localhost:8080/wallet/cancel",
  },
  provider: {
    url: process.env.PROVIDER_URL,
    apiKey: process.env.PROVIDER_API_KEY,
  },
  queue: {
    prefix: process.env.BULLMQ_PREFIX ?? "nexora",
  },
  cache: {
    ttlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 120),
  },
});
