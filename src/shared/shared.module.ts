import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { configModuleOptions } from './configs/module-options';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AppLoggerModule } from './logger/logger.module';
import { PrismaService } from './prisma-module/prisma.service';

@Module({
  imports: [ConfigModule.forRoot(configModuleOptions), AppLoggerModule],
  exports: [AppLoggerModule, ConfigModule, PrismaService],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },

    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    PrismaService,
  ],
})
export class SharedModule {}
