import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEmail, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsString()
  wilaya!: string;

  @IsString()
  commune!: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
  status!: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}
