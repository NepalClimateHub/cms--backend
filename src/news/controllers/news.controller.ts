import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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
import { NewsService } from "../services/news.service";
import {
  CreateNewsDto,
  NewsResponseDto,
  NewsSearchInput,
  UpdateNewsDto,
} from "../dto/news.dto";

@ApiTags("news")
@Controller("news")
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(NewsController.name);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: "Get news API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([NewsResponseDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getNews(
    @ReqContext() ctx: RequestContext,
    @Query() query: NewsSearchInput
  ): Promise<BaseApiResponse<NewsResponseDto[]>> {
    this.logger.log(ctx, `${this.getNews.name} was called`);

    const { news, count } = await this.newsService.getNews(ctx, query);
    return { data: news, meta: { count } };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: "Add news API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(NewsResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async addNews(
    @ReqContext() ctx: RequestContext,
    @Body() payload: CreateNewsDto
  ): Promise<BaseApiResponse<NewsResponseDto>> {
    this.logger.log(ctx, `${this.addNews.name} was called`);

    const news = await this.newsService.addNews(ctx, payload);
    return { data: news, meta: {} };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get("/:id")
  @ApiOperation({
    summary: "Get one news item API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(NewsResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getOneNews(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string
  ): Promise<BaseApiResponse<NewsResponseDto>> {
    this.logger.log(ctx, `${this.getOneNews.name} was called`);

    const news = await this.newsService.getOneNews(ctx, id);
    return { data: news, meta: {} };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete("/:id")
  @ApiOperation({
    summary: "Delete one news item API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(NewsResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async deleteNews(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string
  ): Promise<BaseApiResponse<NewsResponseDto>> {
    this.logger.log(ctx, `${this.deleteNews.name} was called`);

    const news = await this.newsService.deleteNews(ctx, id);
    return { data: news, meta: {} };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch("/:id")
  @ApiOperation({
    summary: "Update one news item API",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(NewsResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async updateNews(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
    @Body() payload: UpdateNewsDto
  ): Promise<BaseApiResponse<NewsResponseDto>> {
    this.logger.log(ctx, `${this.updateNews.name} was called`);

    const news = await this.newsService.updateNews(ctx, id, payload);
    return { data: news, meta: {} };
  }
}
