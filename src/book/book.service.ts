import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  BookNotFoundException,
  DuplicateEntryException,
} from '../common/exceptions/custom.exception';
import { CustomLogger } from 'src/common/services/logger.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly logger: CustomLogger,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    this.logger.log(`Creating new book: ${createBookDto.title}`, 'BookService');

    const existingBook = await this.bookRepository.findOne({
      where: { isbn: createBookDto.isbn },
    });

    if (existingBook) {
      throw new DuplicateEntryException(
        `Book with ISBN ${createBookDto.isbn} already exists`,
      );
    }

    const book = this.bookRepository.create(createBookDto);
    return await this.bookRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return await this.bookRepository.find();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
    });

    if (!book) {
      throw new BookNotFoundException(id);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    this.logger.log(`Updating book with id: ${id}`, 'BookService');
    const book = await this.findOne(id);

    if (updateBookDto.isbn) {
      const existingBook = await this.bookRepository.findOne({
        where: { isbn: updateBookDto.isbn },
      });

      if (existingBook && existingBook.id !== id) {
        throw new DuplicateEntryException(
          `Book with ISBN ${updateBookDto.isbn} already exists`,
        );
      }
    }

    Object.assign(book, updateBookDto);
    return await this.bookRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing book with id: ${id}`, 'BookService');
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }
}
