import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  async create(
    @Body() dto: CreateStockMovementDto,
    @CurrentUser() user: any,
  ) {
    // accountability: userId is pulled from the JWT payload
    return this.stockMovementsService.create(dto, user.userId || user.id || user.sub);
  }

  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.stockMovementsService.findByProduct(productId);
  }
}
