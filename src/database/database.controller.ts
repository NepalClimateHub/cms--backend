import { Controller, Get, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { DatabaseService } from './database.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '../auth/constants/role.constant';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('database')
@Controller('database')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DatabaseController {
  private readonly logger = new Logger(DatabaseController.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @Get('export')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Export database as a ZIP file' })
  @ApiResponse({ status: 200, description: 'ZIP file containing the database dump' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async export(@Res() res: Response) {
    this.logger.log('Database export request received');
    return this.databaseService.exportDatabase(res);
  }
}
