import { Module } from "@nestjs/common";
import { MemberService } from "./services/member.service";
import { MemberController } from "./controllers/member.controller";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
