import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import {
  BookNotFoundException,
  DuplicateEntryException,
} from '../common/exceptions/custom.exception';
import { CustomLogger } from 'src/common/services/logger.service';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly logger: CustomLogger,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    this.logger.log(
      `Attempting to create book: ${createBookDto.title}`,
      'BookService',
    );

    const existingBook = await this.bookRepository.findOne({
      where: { isbn: createBookDto.isbn },
    });

    if (existingBook) {
      this.logger.warn(
        `Duplicate book creation attempt with ISBN: ${createBookDto.isbn}`,
        'BookService',
      );
      throw new DuplicateEntryException(
        `Book with ISBN ${createBookDto.isbn} already exists`,
      );
    }

    const book = this.bookRepository.create(createBookDto);
    const savedBook = await this.bookRepository.save(book);
    this.logger.log(
      `Successfully created book: ${savedBook.title}`,
      'BookService',
    );
    return savedBook;
  }

  async findOne(id: number): Promise<Book> {
    this.logger.log(`Searching for book with ID: ${id}`, 'BookService');

    const book = await this.bookRepository.findOne({
      where: { id },
    });

    if (!book) {
      this.logger.error(`Book not found with ID: ${id}`, 'BookService');
      throw new BookNotFoundException(id);
    }

    this.logger.log(`Found book: ${book.title}`, 'BookService');
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
