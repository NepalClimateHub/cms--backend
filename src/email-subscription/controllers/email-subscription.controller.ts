import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { EmailSubscriptionService } from '../services/email-subscription.service';

@Controller('email-subscription')
export class EmailSubscriptionController {
  constructor(private readonly service: EmailSubscriptionService) {}

  @Post('subscribe')
  async subscribe(@Body('email') email: string) {
    return this.service.subscribe(email);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
} 
