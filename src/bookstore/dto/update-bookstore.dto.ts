import { PartialType } from '@nestjs/swagger';
import { CreateBookStoreDto } from './create-bookstore.dto';

export class UpdateBookStoreDto extends PartialType(CreateBookStoreDto) {}
