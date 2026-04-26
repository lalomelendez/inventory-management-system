import { Injectable } from '@nestjs/common';
import { db } from '@repo/db';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  async create(dto: CreateStockMovementDto, userId: string) {
    return db.stockMovement.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findByProduct(productId: string) {
    return db.stockMovement.findMany({
      where: { productId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
