import { IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdParam {
  @ApiProperty({ example: '1', description: 'ID parameter' })
  @IsNumberString({}, { message: 'ID bir sayı olmalıdır' })
  id: string;
}

export class BookStoreBookParams {
  @ApiProperty({ example: '1', description: 'Store ID' })
  @IsNumberString({}, { message: 'Store ID bir sayı olmalıdır' })
  storeId: string;

  @ApiProperty({ example: '1', description: 'Book ID' })
  @IsNumberString({}, { message: 'Book ID bir sayı olmalıdır' })
  bookId: string;
}
