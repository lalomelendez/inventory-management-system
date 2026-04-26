import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, db, StockMovement } from '@repo/db';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Type intersection to include the derived stock property
export type ProductWithStock = Product & { currentStock: number };

@Injectable()
export class ProductsService {
  async findAll(): Promise<ProductWithStock[]> {
    const products = await db.product.findMany({
      include: { 
        category: true, 
        supplier: true, 
        location: true,
        stockMovements: true 
      },
    });

    return products.map(product => this._attachStock(product));
  }

  async findOne(id: string): Promise<ProductWithStock> {
    const product = await db.product.findUnique({
      where: { id },
      include: { 
        category: true, 
        supplier: true, 
        location: true,
        stockMovements: true 
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this._attachStock(product);
  }

  private _attachStock(product: any): ProductWithStock {
    const currentStock = (product.stockMovements || []).reduce((total: number, movement: StockMovement) => {
      if (movement.type === 'IN') return total + movement.quantity;
      if (movement.type === 'OUT' || movement.type === 'ADJUSTMENT') return total - movement.quantity;
      return total;
    }, 0);

    return {
      ...product,
      currentStock,
    };
  }

  async create(dto: CreateProductDto): Promise<Product> {
    return db.product.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);
    return db.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<Product> {
    await this.findOne(id);
    return db.product.delete({
      where: { id },
    });
  }
}
