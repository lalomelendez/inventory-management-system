import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePOStatusDto } from './dto/create-purchase-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@repo/db';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Post()
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @CurrentUser() user: any) {
    return this.purchaseOrdersService.create(createPurchaseOrderDto, user.userId || user.id || user.sub);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.LOGISTICS)
  updateStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdatePOStatusDto,
    @CurrentUser() user: any
  ) {
    return this.purchaseOrdersService.updateStatus(id, updateStatusDto, user.userId || user.id || user.sub);
  }
}
