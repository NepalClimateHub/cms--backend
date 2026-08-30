import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { SharedModule } from "../shared/shared.module";
import { AiAssistantService } from "./services/ai-assistant.service";
import { AiAssistantController } from "./controllers/ai-assistant.controller";
import {
  AiDocumentAdminController,
  AiDocumentInternalController,
} from "./controllers/ai-document-admin.controller";
import { RagServiceTokenGuard } from "./guards/rag-service-token.guard";
import {
  ClimateDataAdminController,
  ClimateDataClientController,
  ClimateDataInternalController,
} from "./controllers/climate-data.controller";
import { ClimateDataService } from "./services/climate-data.service";
import { ClimateDataScheduler } from "./services/climate-data.scheduler";
import { ClimateOntologyService } from "./services/climate-ontology.service";

@Module({
  imports: [
    SharedModule,
    HttpModule.register({
      timeout: 60000, // 60s timeout for RAG responses (LLM can be slow)
      maxRedirects: 3,
    }),
  ],
  providers: [
    AiAssistantService,
    ClimateDataService,
    ClimateDataScheduler,
    ClimateOntologyService,
    RagServiceTokenGuard,
  ],
  controllers: [
    AiAssistantController,
    AiDocumentAdminController,
    AiDocumentInternalController,
    ClimateDataAdminController,
    ClimateDataClientController,
    ClimateDataInternalController,
  ],
  exports: [AiAssistantService, ClimateDataService, ClimateOntologyService],
})
export class AiAssistantModule {}
