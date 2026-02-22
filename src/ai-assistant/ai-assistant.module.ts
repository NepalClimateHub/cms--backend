import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { SharedModule } from "../shared/shared.module";
import { AiAssistantService } from "./services/ai-assistant.service";
import { AiAssistantController } from "./controllers/ai-assistant.controller";

@Module({
  imports: [
    SharedModule,
    HttpModule.register({
      timeout: 60000, // 60s timeout for RAG responses (LLM can be slow)
      maxRedirects: 3,
    }),
  ],
  providers: [AiAssistantService],
  controllers: [AiAssistantController],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
