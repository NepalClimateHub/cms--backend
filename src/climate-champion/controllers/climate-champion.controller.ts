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
import { ClimateChampionService } from "../services/climate-champion.service";
import {
  CreateClimateChampionDto,
  ClimateChampionResponseDto,
  ClimateChampionSearchInput,
  ReorderChampionsDto,
  UpdateClimateChampionDto,
} from "../dto/climate-champion.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BaseApiResponse, SwaggerBaseApiResponse, BaseApiErrorResponse } from "../../shared/dtos/base-api-response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/role.decorator";
import { ROLE } from "../../auth/constants/role.constant";

@ApiTags("Climate Champions")
@Controller("climate-champions")
export class ClimateChampionController {
  constructor(private readonly championService: ClimateChampionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new Climate Champion" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(ClimateChampionResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async createClimateChampion(
    @Body() createDto: CreateClimateChampionDto,
  ): Promise<BaseApiResponse<ClimateChampionResponseDto>> {
    const champion = await this.championService.createClimateChampion(createDto);
    return { data: champion, meta: {} };
  }

  @Get()
  @ApiOperation({ summary: "Get all Climate Champions with search and pagination" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([ClimateChampionResponseDto]),
  })
  async findAllClimateChampions(
    @Query() searchInput: ClimateChampionSearchInput,
  ): Promise<BaseApiResponse<ClimateChampionResponseDto[]>> {
    const result = await this.championService.findAllClimateChampions(searchInput);
    return { data: result.champions, meta: { count: result.total } };
  }

  @Get(":id")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get a Climate Champion by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ClimateChampionResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findClimateChampionById(
    @Param("id") id: string,
  ): Promise<BaseApiResponse<ClimateChampionResponseDto>> {
    const champion = await this.championService.findClimateChampionById(id);
    return { data: champion, meta: {} };
  }

  @Patch("reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reorder Climate Champions" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Climate Champions reordered successfully",
  })
  async reorderClimateChampions(
    @Body() body: ReorderChampionsDto,
  ): Promise<BaseApiResponse<null>> {
    await this.championService.reorderClimateChampions(body.orders);
    return { data: null, meta: {} };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a Climate Champion" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ClimateChampionResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async updateClimateChampion(
    @Param("id") id: string,
    @Body() updateDto: UpdateClimateChampionDto,
  ): Promise<BaseApiResponse<ClimateChampionResponseDto>> {
    const champion = await this.championService.updateClimateChampion(id, updateDto);
    return { data: champion, meta: {} };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a Climate Champion" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Climate Champion deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async deleteClimateChampion(
    @Param("id") id: string,
  ): Promise<BaseApiResponse<null>> {
    await this.championService.deleteClimateChampion(id);
    return { data: null, meta: {} };
  }
}
