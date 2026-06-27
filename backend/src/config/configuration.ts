const PLACEHOLDER_PATTERNS = [
  /^replace[-_]with/i,
  /^change[-_]me/i,
  /^your[-_]/i,
  /^example/i,
  /^secret$/i,
  /^password$/i,
  /^xxx+$/i,
];

function isPlaceholderSecret(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value.trim()));
}

function assertStrongSecret(name: string, value: string | undefined): void {
  if (!value) return;
  if (isPlaceholderSecret(value)) {
    throw new Error(
      `${name} contains a placeholder value ("${value.slice(0, 20)}…"). Set a real cryptographic secret before starting in production.`
    );
  }
  const entropy = new Set(value).size;
  if (entropy < 10) {
    throw new Error(
      `${name} has very low entropy (${entropy} unique chars). Use a cryptographically random secret (e.g. openssl rand -base64 48).`
    );
  }
}

export default () => {
  const isProduction = (process.env.NODE_ENV ?? "development") === "production";

  if (isProduction) {
    assertStrongSecret("JWT_ACCESS_SECRET", process.env.JWT_ACCESS_SECRET);
    assertStrongSecret("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET);

    if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
      throw new Error(
        "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values."
      );
    }

    if (process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
      throw new Error(
        "STRIPE_SECRET_KEY is a test key. Use a live key in production."
      );
    }
  }

  return {
    app: {
      nodeEnv: process.env.NODE_ENV ?? "development",
      port: Number(process.env.PORT ?? 4000),
      apiPrefix: process.env.API_PREFIX ?? "api",
      frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:8080",
      logLevel: process.env.LOG_LEVEL ?? "debug",
      trustProxy: isProduction || process.env.TRUST_PROXY === "true",
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
      refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME ?? "nexora_refresh",
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
    adminBootstrap: {
      email: process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase() || undefined,
      password: process.env.ADMIN_BOOTSTRAP_PASSWORD,
      fullName: process.env.ADMIN_BOOTSTRAP_FULL_NAME?.trim() || "Platform Admin",
    },
  };
};
