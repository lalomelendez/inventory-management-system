import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, db } from '@repo/db';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  async findAll(): Promise<Product[]> {
    // Phase 4.1: The Relational Domain Model
    return db.product.findMany({
      include: { category: true },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await db.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
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
