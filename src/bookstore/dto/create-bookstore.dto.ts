import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookStoreDto {
  @ApiProperty({ example: 'Downtown Books' })
  @IsString()
  @MinLength(2, { message: 'Mağaza adı en az 2 karakter olmalıdır' })
  name: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @MinLength(5, { message: 'Adres en az 5 karakter olmalıdır' })
  address: string;
}
