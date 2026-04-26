import { Injectable } from '@nestjs/common';
import { db } from '@repo/db';

@Injectable()
export class LocationsService {
  async findAll() {
    return db.location.findMany();
  }
}
