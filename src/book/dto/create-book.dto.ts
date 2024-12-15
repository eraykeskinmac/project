import {
  IsString,
  IsNumber,
  MinLength,
  IsISBN,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Code' })
  @IsString()
  @MinLength(2, { message: 'Kitap adı en az 2 karakter olmalıdır' })
  title: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  @IsString()
  @MinLength(2, { message: 'Yazar adı en az 2 karakter olmalıdır' })
  author: string;

  @ApiProperty({ example: '9780132350884' })
  @IsISBN(undefined, { message: 'Geçerli bir ISBN numarası giriniz' })
  isbn: string;

  @ApiProperty({ example: 44.99 })
  @IsNumber()
  @IsPositive({ message: 'Fiyat pozitif bir sayı olmalıdır' })
  price: number;
}
