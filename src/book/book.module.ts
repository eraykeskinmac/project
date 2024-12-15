import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { LoggerModule } from 'src/common/modules/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), LoggerModule],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
