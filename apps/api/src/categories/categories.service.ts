import { Injectable } from '@nestjs/common';
import { db, Category } from '@repo/db';

@Injectable()
export class CategoriesService {
  async findAll(): Promise<Category[]> {
    return db.category.findMany();
  }
}
