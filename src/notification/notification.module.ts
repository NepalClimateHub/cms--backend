import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";

@Module({
  imports: [SharedModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
