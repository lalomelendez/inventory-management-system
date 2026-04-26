import { Injectable } from '@nestjs/common';
import { db } from '@repo/db';

@Injectable()
export class SuppliersService {
  async findAll() {
    return db.supplier.findMany();
  }
}
