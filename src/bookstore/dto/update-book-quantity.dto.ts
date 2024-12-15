import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookQuantityDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsPositive({ message: 'Miktar pozitif bir sayı olmalıdır' })
  @Min(1, { message: 'Miktar en az 1 olmalıdır' })
  quantity: number;
}
