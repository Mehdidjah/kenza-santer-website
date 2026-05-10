import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SaveProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  full_description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  original_price?: number | null;

  @IsOptional()
  @IsString()
  badge?: string | null;

  @IsOptional()
  @IsBoolean()
  in_stock?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  review_count?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  how_to_use?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  precautions?: string[];
}

export class PresignProductImageDto {
  @IsString()
  fileName!: string;

  @IsString()
  contentType!: string;
}

export class UploadProductImageDto extends PresignProductImageDto {
  @IsString()
  base64!: string;
}
