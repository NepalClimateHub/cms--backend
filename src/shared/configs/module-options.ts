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
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().required(),
    SMTP_USER: Joi.string().required(),
    SMTP_PASS: Joi.string().required(),
    BASE_URL: Joi.string().required(),
    FRONTEND_BASE_URL: Joi.string().allow(''),
  }),
};
