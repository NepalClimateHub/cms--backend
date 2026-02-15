import { Module } from '@nestjs/common';
import { ResourceService } from './services/resource.service';
import { ResourceController } from './controllers/resource.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourceModule {}
