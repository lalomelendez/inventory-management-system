import { Controller, Get, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async findAll() {
    return this.locationsService.findAll();
  }
}
