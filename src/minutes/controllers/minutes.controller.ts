import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MinutesService } from '../services/minutes.service';
import { CreateMinutesDto, UpdateMinutesDto, MinutesSearchInput, MinutesResponseDto } from '../dto/minutes.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/role.decorator';
import { ROLE } from '../../auth/constants/role.constant';
import { BaseApiResponse } from '../../shared/dtos/base-api-response.dto';

@ApiTags('Minutes')
@Controller('minutes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.CONTENT_ADMIN)
export class MinutesController {
  constructor(private readonly minutesService: MinutesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new minutes record' })
  @ApiResponse({ status: 201, description: 'The minutes have been successfully created.', type: MinutesResponseDto })
  async create(@Body() createMinutesDto: CreateMinutesDto): Promise<BaseApiResponse<MinutesResponseDto>> {
    const data = await this.minutesService.createMinutes(createMinutesDto);
    return { data, meta: {} };
  }

  @Get()
  @ApiOperation({ summary: 'Get all minutes records' })
  @ApiResponse({ status: 200, description: 'Return all minutes.', type: [MinutesResponseDto] })
  async findAll(@Query() searchInput: MinutesSearchInput): Promise<BaseApiResponse<MinutesResponseDto[]>> {
    const { minutes, total } = await this.minutesService.findAllMinutes(searchInput);
    return { data: minutes, meta: { total } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a minutes record by id' })
  @ApiResponse({ status: 200, description: 'Return the minutes.', type: MinutesResponseDto })
  async findOne(@Param('id') id: string): Promise<BaseApiResponse<MinutesResponseDto>> {
    const data = await this.minutesService.findMinutesById(id);
    return { data, meta: {} };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a minutes record' })
  @ApiResponse({ status: 200, description: 'The minutes have been successfully updated.', type: MinutesResponseDto })
  async update(@Param('id') id: string, @Body() updateMinutesDto: UpdateMinutesDto): Promise<BaseApiResponse<MinutesResponseDto>> {
    const data = await this.minutesService.updateMinutes(id, updateMinutesDto);
    return { data, meta: {} };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a minutes record' })
  @ApiResponse({ status: 200, description: 'The minutes have been successfully deleted.' })
  async remove(@Param('id') id: string): Promise<BaseApiResponse<null>> {
    await this.minutesService.deleteMinutes(id);
    return { data: null, meta: {} };
  }
}
