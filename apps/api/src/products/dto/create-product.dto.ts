import { IsNotEmpty, IsNumber, IsString, Min, IsInt, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  minimumStockLevel?: number;
}
