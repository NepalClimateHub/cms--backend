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
});
