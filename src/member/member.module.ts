import { Module } from "@nestjs/common";
import { MemberService } from "./services/member.service";
import { MemberController } from "./controllers/member.controller";
import { SharedModule } from "../shared/shared.module";
import { ActivityLogModule } from "../activity-log/activity-log.module";

@Module({
  imports: [SharedModule, ActivityLogModule],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
