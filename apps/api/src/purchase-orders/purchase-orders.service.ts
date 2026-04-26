import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { db, POStatus, MovementType } from '@repo/db';
import { CreatePurchaseOrderDto, UpdatePOStatusDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  async findAll() {
    return db.purchaseOrder.findMany({
      include: {
        supplier: true,
        creator: true,
        approver: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const po = await db.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        creator: true,
        approver: true,
        items: { include: { product: true } },
      },
    });
    if (!po) throw new NotFoundException('Purchase Order not found');
    return po;
  }

  async create(dto: CreatePurchaseOrderDto, creatorId: string) {
    return db.purchaseOrder.create({
      data: {
        supplierId: dto.supplierId,
        creatorId,
        status: POStatus.DRAFT,
        items: {
          create: dto.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, dto: UpdatePOStatusDto, userId: string) {
    const po = await this.findOne(id);

    // Basic state machine validation
    this.validateStatusTransition(po.status as POStatus, dto.status as POStatus);

    return db.$transaction(async (tx: any) => {
      const updateData: any = { status: dto.status };

      // If approving/rejecting, stamp the approver
      if (dto.status === POStatus.APPROVED || dto.status === POStatus.REJECTED) {
        updateData.approverId = userId;
      }

      const updatedPo = await tx.purchaseOrder.update({
        where: { id },
        data: updateData,
        include: { items: true },
      });

      // Automation Bridge: If status is RECEIVED, inject StockMovements
      if ((dto.status as any) === POStatus.RECEIVED) {
        await tx.stockMovement.createMany({
          data: updatedPo.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            type: MovementType.IN,
            userId,
            notes: `Auto-generated from PO #${id}`,
          })),
        });
      }

      return updatedPo;
    });
  }

  private validateStatusTransition(current: POStatus, target: POStatus) {
    // Simple state machine logic
    if (current === POStatus.RECEIVED || current === POStatus.REJECTED) {
      throw new BadRequestException(`Cannot change status of a ${current} Purchase Order`);
    }

    if (target === POStatus.PENDING_APPROVAL && current !== POStatus.DRAFT) {
      throw new BadRequestException('Can only submit DRAFT orders for approval');
    }

    if ((target === POStatus.APPROVED || target === POStatus.REJECTED) && current !== POStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Can only approve/reject PENDING orders');
    }

    if (target === POStatus.RECEIVED && current !== POStatus.APPROVED) {
      throw new BadRequestException('Can only receive APPROVED orders');
    }
  }
}
