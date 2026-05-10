import { Controller, Sse, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { EventsService } from './events.service';

@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Sse('events')
  publicEvents() {
    return this.events.publicStream();
  }

  @Sse('admin/events')
  @UseGuards(AdminGuard)
  adminEvents() {
    return this.events.adminStream();
  }
}
