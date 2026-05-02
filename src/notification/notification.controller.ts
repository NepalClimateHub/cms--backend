import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Delete,
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
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from "../shared/dtos/base-api-response.dto";
import { PaginationParamsDto } from "../shared/dtos/pagination-params.dto";
import { ReqContext } from "../shared/request-context/req-context.decorator";
import { RequestContext } from "../shared/request-context/request-context.dto";
import { NotificationOutputDto } from "./dto/notification-output.dto";
import { NotificationService } from "./notification.service";

@ApiTags("notifications")
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "List notifications for the current user" })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([NotificationOutputDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async list(
    @ReqContext() ctx: RequestContext,
    @Query() query: PaginationParamsDto,
  ): Promise<
    BaseApiResponse<NotificationOutputDto[]> & {
      meta: { count: number; unreadCount: number };
    }
  > {
    const userId = ctx.user!.id;
    const { items, total, unreadCount } =
      await this.notificationService.findForUser(
        userId,
        query.limit,
        query.offset,
      );
    return {
      data: items,
      meta: { count: total, unreadCount },
    };
  }

  @Patch(":id/read")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async markRead(
    @Param("id") id: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<void>> {
    await this.notificationService.markRead(id, ctx.user!.id);
    return { data: undefined, meta: {} };
  }

  @Patch("mark-all-read")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async markAllRead(
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<void>> {
    await this.notificationService.markAllRead(ctx.user!.id);
    return { data: undefined, meta: {} };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a notification" })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async delete(
    @Param("id") id: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<BaseApiResponse<void>> {
    await this.notificationService.deleteNotification(id, ctx.user!.id);
    return { data: undefined, meta: {} };
  }
}
