import {
  ExecutionContext,
  NotAcceptableException,
  createParamDecorator,
} from "@nestjs/common";
import { Request } from "express";
import * as Joi from "joi";
export type SortingParam = {
  property: string;
  direction: string;
};

export const SortingParams = createParamDecorator(
  (validParams, ctx: ExecutionContext): SortingParam | null => {
    const req: Request = ctx.switchToHttp().getRequest();
    const sort = req.query.sort as string;
    if (!sort) return null;

    // check if the valid params sent is an array
    if (typeof validParams != "object")
      throw new NotAcceptableException("Invalid sort parameter");

    const schema = Joi.object({
      property: Joi.string()
        .valid(...validParams)
        .required(),
      direction: Joi.string().valid("asc", "desc").required(),
    });
    const { error, value } = schema.validate({
      property: sort.split(":")[0],
      direction: sort.split(":")[1],
    });
    if (error) throw new NotAcceptableException(error.message);
    const { property, direction } = value;
    return { property, direction };
  }
);
