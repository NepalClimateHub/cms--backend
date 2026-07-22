import { Module } from "@nestjs/common";
import { TestimonialController } from "./controllers/testimonial.controller";
import { TestimonialService } from "./services/testimonial.service";
import { SharedModule } from "../shared/shared.module";
import { ActivityLogModule } from "../activity-log/activity-log.module";

@Module({
  imports: [SharedModule, ActivityLogModule],
  controllers: [TestimonialController],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class TestimonialModule {}
