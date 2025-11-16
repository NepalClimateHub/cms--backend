import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { EmailSubscriptionService } from "./services/email-subscription.service";
import { EmailSubscriptionController } from "./controllers/email-subscription.controller";

@Module({
  imports: [SharedModule],
  providers: [EmailSubscriptionService],
  controllers: [EmailSubscriptionController],
})
export class EmailSubscriptionModule {}
