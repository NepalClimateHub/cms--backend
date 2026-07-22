import { Module } from '@nestjs/common';
import { MinutesService } from './services/minutes.service';
import { MinutesController } from './controllers/minutes.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [MinutesController],
  providers: [MinutesService],
  exports: [MinutesService],
})
export class MinutesModule {}
