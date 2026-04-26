import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { LocationsModule } from './locations/locations.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ProductsModule,
    CategoriesModule,
    AuthModule,
    SuppliersModule,
    LocationsModule,
    StockMovementsModule,
    PurchaseOrdersModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
