export default (): any => ({
  env: process.env.APP_ENV,
  port: process.env.APP_PORT,
  jwt: {
    publicKey: Buffer.from(
      process.env.JWT_PUBLIC_KEY_BASE64!,
      "base64"
    ).toString("utf8"),
    privateKey: Buffer.from(
      process.env.JWT_PRIVATE_KEY_BASE64!,
      "base64"
    ).toString("utf8"),
    accessTokenExpiresInSec: parseInt(
      process.env.JWT_ACCESS_TOKEN_EXP_IN_SEC!,
      10
    ),
    refreshTokenExpiresInSec: parseInt(
      process.env.JWT_REFRESH_TOKEN_EXP_IN_SEC!,
      10
    ),
  },
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUB_KEY,
    privateKey: process.env.IMAGEKIT_PVT_KEY,
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_USER,
  },
  urls: {
    baseUrl: process.env.BASE_URL,
    frontendBaseUrl: process.env.FRONTEND_BASE_URL,
  },
});
