import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../auth/decorators/role.decorator";
import { ROLE } from "../../auth/constants/role.constant";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { ReqContext } from "../../shared/request-context/req-context.decorator";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import {
  ClimateSyncDto,
  ClimateClientMetricDto,
  InternalClimateBatchDto,
  InternalClimateQueryDto,
  InternalClimateRunUpdateDto,
} from "../dtos/climate-data.dto";
import { RagServiceTokenGuard } from "../guards/rag-service-token.guard";
import { ClimateDataService } from "../services/climate-data.service";
import { ClimateOntologyService } from "../services/climate-ontology.service";

@ApiTags("ai-assistant-climate-admin")
@ApiBearerAuth()
@Controller("ai-assistant/admin/climate-data")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN)
export class ClimateDataAdminController {
  constructor(
    private readonly climateData: ClimateDataService,
    private readonly ontology: ClimateOntologyService,
  ) {}

  @Get("status")
  status() {
    return this.climateData.getStatus();
  }

  @Post("sync")
  @HttpCode(HttpStatus.ACCEPTED)
  sync(@ReqContext() ctx: RequestContext, @Body() dto: ClimateSyncDto) {
    return this.climateData.startAdminSync(ctx, dto.mode);
  }

  @Post("ontology/rebuild")
  rebuildOntology() {
    return this.ontology.seed();
  }
}

@ApiTags("ai-assistant-climate-internal")
@Controller("ai-assistant/internal/climate-data")
@UseGuards(RagServiceTokenGuard)
export class ClimateDataInternalController {
  constructor(
    private readonly climateData: ClimateDataService,
    private readonly ontology: ClimateOntologyService,
  ) {}

  @Post("batches")
  @HttpCode(HttpStatus.ACCEPTED)
  batch(@Body() dto: InternalClimateBatchDto) {
    return this.climateData.acceptBatch(dto);
  }

  @Patch("runs/:runId")
  updateRun(
    @Param("runId") runId: string,
    @Body() dto: InternalClimateRunUpdateDto,
  ) {
    return this.climateData.updateRun(runId, dto);
  }

  @Post("query")
  query(@Body() dto: InternalClimateQueryDto) {
    return this.climateData.queryStructured(dto);
  }

  @Get("ontology")
  ontologyExport() {
    return this.ontology.exportActive();
  }
}

@ApiTags("ai-assistant-climate-data")
@ApiBearerAuth()
@Controller("ai-assistant/climate-data")
@UseGuards(JwtAuthGuard)
export class ClimateDataClientController {
  constructor(private readonly climateData: ClimateDataService) {}

  @Post("metrics")
  @HttpCode(HttpStatus.ACCEPTED)
  metric(@ReqContext() ctx: RequestContext, @Body() dto: ClimateClientMetricDto) {
    return this.climateData.recordClientMetric(ctx.user?.id, dto.event);
  }
}
