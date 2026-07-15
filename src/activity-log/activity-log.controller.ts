import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '../auth/constants/role.constant';
import {
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../shared/dtos/base-api-response.dto';
import { ActivityLogService } from './activity-log.service';
import {
  ActivityLogQueryDto,
  ActivityLogResponseDto,
} from './dto/activity-log.dto';

@ApiTags('Activity Logs')
@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE.SUPER_ADMIN)
@ApiExtraModels(ActivityLogResponseDto)
@ApiBearerAuth()
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) { }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'Get paginated activity logs (SUPER_ADMIN only)',
    description:
      'Returns a paginated, filterable list of admin/content-admin activity across all content types.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([ActivityLogResponseDto]),
  })
  async getActivityLogs(
    @Query() query: ActivityLogQueryDto,
  ): Promise<BaseApiResponse<ActivityLogResponseDto[]>> {
    const { data, total } = await this.activityLogService.getActivities(query);
    return { data, meta: { total, page: query.page, limit: query.limit } };
  }
}
