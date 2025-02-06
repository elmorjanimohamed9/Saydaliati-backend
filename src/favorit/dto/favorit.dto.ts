import { IsArray, IsOptional } from 'class-validator';

export class FavoritDto {
  @IsArray()
  @IsOptional()
  favorites?: string[];
}
