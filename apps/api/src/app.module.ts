import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { LocationsModule } from './locations/locations.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';

@Module({
  imports: [
    ProductsModule,
    CategoriesModule,
    AuthModule,
    SuppliersModule,
    LocationsModule,
    StockMovementsModule,
    PurchaseOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
