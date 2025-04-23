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

import { ROLE } from "../../auth/constants/role.constant";
import { Roles } from "../../auth/decorators/role.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from "../../shared/dtos/base-api-response.dto";
import { PaginationParamsDto } from "../../shared/dtos/pagination-params.dto";
import { AppLogger } from "../../shared/logger/logger.service";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { TagsService } from "../services/tags.service";
import { TagOutputDto } from "../dto/tags-output.dto";
import { AddTagDto, TagSearchInput } from "../dto/tags-input.dto";

@ApiTags("tags")
@Controller("tags")
export class TagController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(TagController.name);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addTag(
    @ReqContext() ctx: RequestContext,
    @Body() payload: AddTagDto
  ): Promise<BaseApiResponse<TagOutputDto>> {
    this.logger.log(ctx, `${this.addTag.name} was called`);
    const roleData = await this.tagsService.addTag(ctx, payload);
    return { data: roleData, meta: {} };
  }
}
