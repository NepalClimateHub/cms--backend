import { Module } from '@nestjs/common';

import { ActivityLogModule } from '../activity-log/activity-log.module';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { SharedModule } from '../shared/shared.module';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserAclService } from './services/user-acl.service';

@Module({
  imports: [SharedModule, ActivityLogModule],
  providers: [UserService, JwtAuthStrategy, UserAclService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule { }
