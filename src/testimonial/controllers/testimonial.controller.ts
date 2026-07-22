import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
} from "@nestjs/common";
import { TestimonialService } from "../services/testimonial.service";
import {
  CreateTestimonialDto,
  TestimonialResponseDto,
  TestimonialSearchInput,
  ReorderTestimonialsDto,
  UpdateTestimonialDto,
} from "../dto/testimonial.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BaseApiResponse, SwaggerBaseApiResponse, BaseApiErrorResponse } from "../../shared/dtos/base-api-response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/role.decorator";
import { ROLE } from "../../auth/constants/role.constant";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";

@ApiTags("Testimonials")
@Controller("testimonials")
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new Testimonial" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(TestimonialResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async createTestimonial(
    @ReqContext() ctx: RequestContext,
    @Body() createDto: CreateTestimonialDto,
  ): Promise<BaseApiResponse<TestimonialResponseDto>> {
    const testimonial = await this.testimonialService.createTestimonial(createDto, ctx);
    return { data: testimonial, meta: {} };
  }

  @Get()
  @ApiOperation({ summary: "Get all Testimonials with search and pagination" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([TestimonialResponseDto]),
  })
  async findAllTestimonials(
    @Query() searchInput: TestimonialSearchInput,
  ): Promise<BaseApiResponse<TestimonialResponseDto[]>> {
    const result = await this.testimonialService.findAllTestimonials(searchInput);
    return { data: result.testimonials, meta: { count: result.total } };
  }

  @Get(":id")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get a Testimonial by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(TestimonialResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findTestimonialById(
    @Param("id") id: string,
  ): Promise<BaseApiResponse<TestimonialResponseDto>> {
    const testimonial = await this.testimonialService.findTestimonialById(id);
    return { data: testimonial, meta: {} };
  }

  @Patch("reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reorder Testimonials" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Testimonials reordered successfully",
  })
  async reorderTestimonials(
    @Body() body: ReorderTestimonialsDto,
  ): Promise<BaseApiResponse<null>> {
    await this.testimonialService.reorderTestimonials(body.orders);
    return { data: null, meta: {} };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a Testimonial" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(TestimonialResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async updateTestimonial(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
    @Body() updateDto: UpdateTestimonialDto,
  ): Promise<BaseApiResponse<TestimonialResponseDto>> {
    const testimonial = await this.testimonialService.updateTestimonial(id, updateDto, ctx);
    return { data: testimonial, meta: {} };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a Testimonial" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Testimonial deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async deleteTestimonial(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
  ): Promise<BaseApiResponse<null>> {
    await this.testimonialService.deleteTestimonial(id, ctx);
    return { data: null, meta: {} };
  }
}
