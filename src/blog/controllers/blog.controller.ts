import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { BlogService } from "../services/blog.service";
import {
  CreateBlogDto,
  UpdateBlogDto,
  BlogSearchInput,
  BlogResponseDto,
} from "../dto/blog.dto";
import {
  BaseApiResponse,
  SwaggerBaseApiResponse,
  BaseApiErrorResponse,
} from "../../shared/dtos/base-api-response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { Roles } from "../../auth/decorators/role.decorator";
import { ROLE } from "../../auth/constants/role.constant";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RolesGuard } from "../../auth/guards/roles.guard";

@ApiTags("Blogs")
@Controller("blogs")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Create a new blog post" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(BlogResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @ReqContext() ctx: RequestContext
  ): Promise<BaseApiResponse<BlogResponseDto>> {
    const blog = await this.blogService.createBlog(createBlogDto, ctx);
    return { data: blog, meta: {} };
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get all blogs with search and pagination" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([BlogResponseDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async findAllBlogs(
    @Query() searchInput: BlogSearchInput
  ): Promise<BaseApiResponse<BlogResponseDto[]>> {
    const result = await this.blogService.findAllBlogs(searchInput);
    return { data: result.blogs, meta: { count: result.total } };
  }

  @Get("featured")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get featured blogs" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([BlogResponseDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getFeaturedBlogs(): Promise<BaseApiResponse<BlogResponseDto[]>> {
    const blogs = await this.blogService.getFeaturedBlogs();
    return { data: blogs, meta: {} };
  }

  @Get("published")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get published blogs" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([BlogResponseDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getPublishedBlogs(): Promise<BaseApiResponse<BlogResponseDto[]>> {
    const blogs = await this.blogService.getPublishedBlogs();
    return { data: blogs, meta: {} };
  }

  @Get(":id")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get a blog by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(BlogResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findBlogById(
    @Param("id") id: string
  ): Promise<BaseApiResponse<BlogResponseDto>> {
    const blog = await this.blogService.findBlogById(id);
    return { data: blog, meta: {} };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Update a blog" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(BlogResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async updateBlog(
    @Param("id") id: string,
    @Body() updateBlogDto: UpdateBlogDto
  ): Promise<BaseApiResponse<BlogResponseDto>> {
    const blog = await this.blogService.updateBlog(id, updateBlogDto);
    return { data: blog, meta: {} };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Delete a blog" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(BlogResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async deleteBlog(@Param("id") id: string): Promise<BaseApiResponse<void>> {
    await this.blogService.deleteBlog(id);
    return { data: undefined, meta: {} };
  }
}
