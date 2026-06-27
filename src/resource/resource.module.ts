import { Module } from '@nestjs/common';
import { ResourceService } from './services/resource.service';
import { ResourceController } from './controllers/resource.controller';
import { SharedModule } from '../shared/shared.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [SharedModule, ActivityLogModule],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourceModule {}
