import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreatePurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}

import { POStatus } from '@repo/db';

export class UpdatePOStatusDto {
  @IsEnum(POStatus)
  status: POStatus;
}
