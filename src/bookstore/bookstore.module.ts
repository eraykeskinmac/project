import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookStore } from '../entities/bookstore.entity';
import { BookStoreBook } from '../entities/bookstore-book.entity';
import { BookStoreController } from './bookstore.controller';
import { BookStoreService } from './bookstore.service';
import { LoggerModule } from 'src/common/modules/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([BookStore, BookStoreBook]), LoggerModule],
  controllers: [BookStoreController],
  providers: [BookStoreService],
})
export class BookStoreModule {}
