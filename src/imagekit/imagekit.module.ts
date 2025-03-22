import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { ImagekitService } from "./imagekit.service";
import { ImagekitController } from "./imagekit.controller";

@Module({
  imports: [SharedModule],
  providers: [ImagekitService],
  controllers: [ImagekitController],
})
export class ImagekitModule {}
