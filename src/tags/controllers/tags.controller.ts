import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from "../../shared/dtos/base-api-response.dto";
import { AppLogger } from "../../shared/logger/logger.service";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { TagsService } from "../services/tags.service";
import { TagOutputDto } from "../dto/tags-output.dto";
import { AddTagDto, TagSearchInput, TagsType } from "../dto/tags-input.dto";

@ApiTags("tags")
@Controller("tags")
export class TagController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(TagController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: "Get tags API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([TagOutputDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getTags(
    @ReqContext() ctx: RequestContext,
    @Query() query: TagSearchInput
  ): Promise<BaseApiResponse<TagOutputDto[]>> {
    this.logger.log(ctx, `${this.getTags.name} was called`);

    const { tags, count } = await this.tagsService.getTags(ctx, query);
    return { data: tags, meta: { count } };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get("/:type")
  @ApiOperation({
    summary: "Get tags by type API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([TagOutputDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getTagsType(
    @ReqContext() ctx: RequestContext,
    @Param("type") tagType: TagsType
  ): Promise<BaseApiResponse<TagOutputDto[]>> {
    this.logger.log(ctx, `${this.getTagsType.name} was called`);

    const { tags, count } = await this.tagsService.getTagsByType(ctx, tagType);
    return { data: tags, meta: { count } };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: "Add a new tag",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(TagOutputDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async addTag(
    @ReqContext() ctx: RequestContext,
    @Body() payload: AddTagDto
  ): Promise<BaseApiResponse<TagOutputDto>> {
    this.logger.log(ctx, `${this.addTag.name} was called`);
    const roleData = await this.tagsService.addTag(ctx, payload);
    return { data: roleData, meta: {} };
  }
}
