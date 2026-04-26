import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

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
}
