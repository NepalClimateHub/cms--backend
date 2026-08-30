import { ConfigModuleOptions } from "@nestjs/config/dist/interfaces";
import Joi from "joi";

import configuration from "./configuration";

export const configModuleOptions: ConfigModuleOptions = {
  envFilePath: ".env",
  load: [configuration],
  validationSchema: Joi.object({
    APP_ENV: Joi.string()
      .valid("development", "production", "test")
      .default("development"),
    APP_PORT: Joi.number().required(),
    DATABASE_URL: Joi.string().required(),
    JWT_PUBLIC_KEY_BASE64: Joi.string().required(),
    JWT_PRIVATE_KEY_BASE64: Joi.string().required(),
    JWT_ACCESS_TOKEN_EXP_IN_SEC: Joi.number().required(),
    JWT_REFRESH_TOKEN_EXP_IN_SEC: Joi.number().required(),
    IMAGEKIT_PUB_KEY: Joi.string().required(),
    IMAGEKIT_PVT_KEY: Joi.string().required(),
    IMAGEKIT_ENDPOINT: Joi.string().required(),
    // Azure email can be empty locally; the email utility skips sends when it is not configured.
    AZURE_COMMUNICATION_CONNECTION_STRING: Joi.string().allow(""),
    SENDER_EMAIL_ADDRESS: Joi.string().allow(""),
    BASE_URL: Joi.string().required(),
    FRONTEND_BASE_URL: Joi.string().allow(""),
  }),
};
