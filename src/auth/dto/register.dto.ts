import {
  IsEmail,
  IsString,
  MinLength,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive({ message: 'Role ID pozitif bir sayı olmalıdır' })
  roleId: number;
}
