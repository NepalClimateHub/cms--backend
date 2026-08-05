export default (): any => ({
  env: process.env.APP_ENV,
  port: process.env.APP_PORT,
  jwt: {
    publicKey: Buffer.from(
      process.env.JWT_PUBLIC_KEY_BASE64!,
      "base64",
    ).toString("utf8"),
    privateKey: Buffer.from(
      process.env.JWT_PRIVATE_KEY_BASE64!,
      "base64",
    ).toString("utf8"),
    accessTokenExpiresInSec: parseInt(
      process.env.JWT_ACCESS_TOKEN_EXP_IN_SEC!,
      10,
    ),
    refreshTokenExpiresInSec: parseInt(
      process.env.JWT_REFRESH_TOKEN_EXP_IN_SEC!,
      10,
    ),
  },
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUB_KEY,
    privateKey: process.env.IMAGEKIT_PVT_KEY,
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT,
  },
  azureEmail: {
    connectionString: process.env.AZURE_COMMUNICATION_CONNECTION_STRING,
    senderAddress: process.env.SENDER_EMAIL_ADDRESS,
  },
  urls: {
    baseUrl: process.env.BASE_URL,
    frontendBaseUrl: process.env.FRONTEND_BASE_URL,
  },
  rag: {
    serviceUrl: process.env.RAG_SERVICE_URL || "http://localhost:8000",
    serviceToken: process.env.RAG_SERVICE_TOKEN,
  },
  climate: {
    queryCacheTtlMs: parseInt(process.env.CLIMATE_QUERY_CACHE_TTL_MS || "300000", 10),
    queryCacheMaxEntries: parseInt(process.env.CLIMATE_QUERY_CACHE_MAX_ENTRIES || "200", 10),
    queryMaxConcurrency: parseInt(process.env.CLIMATE_QUERY_MAX_CONCURRENCY || "20", 10),
    staleRunMinutes: parseInt(process.env.CLIMATE_STALE_RUN_MINUTES || "60", 10),
    internalUserIds: (process.env.CLIMATE_INTERNAL_USER_IDS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    limitedUserIds: (process.env.CLIMATE_LIMITED_USER_IDS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  },
});
