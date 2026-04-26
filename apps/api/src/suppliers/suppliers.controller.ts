import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async findAll() {
    return this.suppliersService.findAll();
  }
}
