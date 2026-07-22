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
import { MemberService } from "../services/member.service";
import {
  CreateMemberDto,
  UpdateMemberDto,
  MemberSearchInput,
  MemberResponseDto,
  ReorderMembersDto,
} from "../dto/member.dto";
import {
  BaseApiResponse,
  SwaggerBaseApiResponse,
  BaseApiErrorResponse,
} from "../../shared/dtos/base-api-response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { Roles } from "../../auth/decorators/role.decorator";
import { ROLE } from "../../auth/constants/role.constant";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";


@ApiTags("Members")
@Controller("members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Create a new NCH member" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(MemberResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async createMember(
    @ReqContext() ctx: RequestContext,
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<BaseApiResponse<MemberResponseDto>> {
    const member = await this.memberService.createMember(createMemberDto, ctx);
    return { data: member, meta: {} };
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  // @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: "Get all NCH members with search, filters, and pagination",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([MemberResponseDto]),
  })
  async findAllMembers(
    @Query() searchInput: MemberSearchInput,
  ): Promise<BaseApiResponse<MemberResponseDto[]>> {
    const result = await this.memberService.findAllMembers(searchInput);
    return { data: result.members, meta: { count: result.total } };
  }

  @Get(":id")
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  // @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get a member by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MemberResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findMemberById(
    @Param("id") id: string,
  ): Promise<BaseApiResponse<MemberResponseDto>> {
    const member = await this.memberService.findMemberById(id);
    return { data: member, meta: {} };
  }

  @Patch("reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reorder NCH members" })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async reorderMembers(
    @Body() body: ReorderMembersDto,
  ): Promise<BaseApiResponse<void>> {
    await this.memberService.reorderMembers(body.orders);
    return { data: undefined, meta: {} };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Update a member's details" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MemberResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async updateMember(
    @ReqContext() ctx: RequestContext,
    @Param("id") id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<BaseApiResponse<MemberResponseDto>> {
    const member = await this.memberService.updateMember(id, updateMemberDto, ctx);
    return { data: member, meta: {} };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Delete a member" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MemberResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async deleteMember(@ReqContext() ctx: RequestContext, @Param("id") id: string): Promise<BaseApiResponse<void>> {
    await this.memberService.deleteMember(id, ctx);
    return { data: undefined, meta: {} };
  }
}
