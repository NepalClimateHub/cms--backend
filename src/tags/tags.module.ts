import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { TagsService } from "./services/tags.service";
import { TagController } from "./controllers/tags.controller";

@Module({
  imports: [SharedModule],
  providers: [TagsService],
  controllers: [TagController],
  exports: [TagsService],
})
export class TagsModule {}
