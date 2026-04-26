import { Injectable, Logger } from '@nestjs/common';
import { db, StockMovement, Product } from '@repo/db';
import { Cron } from '@nestjs/schedule';

export type ProductWithStock = Product & { currentStock: number };

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  async getCommandCenterPayload() {
    // 2. Defensive Aggregation (Solves the "House of Cards" Crash)
    const [productsResult, poResult, movementsResult] = await Promise.allSettled([
      db.product.findMany({ include: { stockMovements: true } }),
      db.purchaseOrder.findMany({ where: { status: 'PENDING_APPROVAL' }, include: { supplier: true, creator: true } }),
      db.stockMovement.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { product: true, user: true } })
    ]);

    const lowStockItems = productsResult.status === 'fulfilled' ? 
      this._filterLowStock(productsResult.value) : [];
      
    // Return empty arrays if partial failures occur
    const pendingPOs = poResult.status === 'fulfilled' ? poResult.value : [];
    const recentActivity = movementsResult.status === 'fulfilled' ? movementsResult.value : [];

    return {
      lowStockItems,
      pendingPOs,
      recentActivity
    };
  }

  // 3. The Two-Step Memory Pipeline (Solves Prisma "Derived Math" Limits)
  private _filterLowStock(products: any[]) {
    return products.map(product => {
      const currentStock = (product.stockMovements || []).reduce((total: number, movement: StockMovement) => {
        if (movement.type === 'IN') return total + movement.quantity;
        if (movement.type === 'OUT' || movement.type === 'ADJUSTMENT') return total - movement.quantity;
        return total;
      }, 0);
      return { ...product, currentStock };
    }).filter(product => product.currentStock <= product.minimumStockLevel);
  }

  @Cron('0 8 * * *', { timeZone: 'America/Mexico_City' })
  async checkLowStockAlerts() {
    this.logger.log('Running daily stock alerts check...');
    const products = await db.product.findMany({ include: { stockMovements: true } });
    const crisisItems = this._filterLowStock(products);
    
    if (crisisItems.length > 0) {
      this.logger.warn(`ALERT: ${crisisItems.length} products are below their minimum stock level!`);
    } else {
      this.logger.log('All products have healthy stock levels.');
    }
  }
}
