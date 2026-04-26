import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { MovementType } from '@repo/db';

export class CreateStockMovementDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsString()
  @IsOptional()
  notes?: string;
}
