import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { AiAssistantService } from "./services/ai-assistant.service";
import { AiAssistantController } from "./controllers/ai-assistant.controller";

@Module({
  imports: [SharedModule],
  providers: [AiAssistantService],
  controllers: [AiAssistantController],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
