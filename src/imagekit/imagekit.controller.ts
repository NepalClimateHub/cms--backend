import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AppLogger } from "../shared/logger/logger.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from "../shared/dtos/base-api-response.dto";
import { ImagekitResponseDto } from "./imagekit.dto";
import { ImagekitService } from "./imagekit.service";
import { ReqContext } from "../shared/request-context/req-context.decorator";
import { RequestContext } from "../shared/request-context/request-context.dto";

@ApiTags("imagekit")
@Controller("imagekit")
export class ImagekitController {
  constructor(
    private readonly imagekitService: ImagekitService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(ImagekitController.name);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: "Get imagekit auth params",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ImagekitResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getAuthParamas(
    @ReqContext() ctx: RequestContext
  ): Promise<BaseApiResponse<ImagekitResponseDto>> {
    this.logger.log(ctx, `${this.getAuthParamas.name} was called`);

    const ikConfig = await this.imagekitService.getAuthParams(ctx);
    return { data: ikConfig, meta: {} };
  }
}
