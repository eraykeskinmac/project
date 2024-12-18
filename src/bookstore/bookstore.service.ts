import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookStore } from '../entities/bookstore.entity';
import { BookStoreBook } from '../entities/bookstore-book.entity';
import { CreateBookStoreDto } from './dto/create-bookstore.dto';
import { UpdateBookStoreDto } from './dto/update-bookstore.dto';
import {
  BookStoreNotFoundException,
  InsufficientStockException,
  DuplicateEntryException,
} from '../common/exceptions/custom.exception';
import { CustomLogger } from 'src/common/services/logger.service';

@Injectable()
export class BookStoreService {
  constructor(
    @InjectRepository(BookStore)
    private readonly bookStoreRepository: Repository<BookStore>,
    @InjectRepository(BookStoreBook)
    private readonly bookStoreBookRepository: Repository<BookStoreBook>,
    private readonly logger: CustomLogger,
  ) {}

  async create(createBookStoreDto: CreateBookStoreDto): Promise<BookStore> {
    this.logger.log(
      `Creating new bookstore: ${createBookStoreDto.name}`,
      'BookStoreService',
    );

    const existingStore = await this.bookStoreRepository.findOne({
      where: { name: createBookStoreDto.name },
    });

    if (existingStore) {
      throw new DuplicateEntryException(
        `Bookstore with name ${createBookStoreDto.name} already exists`,
      );
    }

    const bookStore = this.bookStoreRepository.create(createBookStoreDto);
    return await this.bookStoreRepository.save(bookStore);
  }

  async findAll(): Promise<BookStore[]> {
    return await this.bookStoreRepository.find({
      relations: ['books', 'books.book'],
    });
  }

  async findOne(id: number): Promise<BookStore> {
    this.logger.log(
      `Searching for bookstore with ID: ${id}`,
      'BookStoreService',
    );

    const bookStore = await this.bookStoreRepository.findOne({
      where: { id },
      relations: ['books', 'books.book'],
    });

    if (!bookStore) {
      this.logger.error(
        `Bookstore not found with ID: ${id}`,
        'BookStoreService',
      );
      throw new BookStoreNotFoundException(id);
    }

    this.logger.log(`Found bookstore: ${bookStore.name}`, 'BookStoreService');
    return bookStore;
  }

  async update(
    id: number,
    updateBookStoreDto: UpdateBookStoreDto,
  ): Promise<BookStore> {
    const bookStore = await this.findOne(id);

    if (updateBookStoreDto.name) {
      const existingStore = await this.bookStoreRepository.findOne({
        where: { name: updateBookStoreDto.name },
      });

      if (existingStore && existingStore.id !== id) {
        throw new DuplicateEntryException(
          `Bookstore with name ${updateBookStoreDto.name} already exists`,
        );
      }
    }

    Object.assign(bookStore, updateBookStoreDto);
    return await this.bookStoreRepository.save(bookStore);
  }

  async addBook(
    storeId: number,
    bookId: number,
    quantity: number,
  ): Promise<BookStoreBook> {
    this.logger.log(
      `Adding ${quantity} books (ID: ${bookId}) to store (ID: ${storeId})`,
      'BookStoreService',
    );
    await this.findOne(storeId);

    const existingRecord = await this.bookStoreBookRepository.findOne({
      where: {
        bookStore: { id: storeId },
        book: { id: bookId },
      },
    });

    if (existingRecord) {
      existingRecord.quantity += quantity;
      return await this.bookStoreBookRepository.save(existingRecord);
    }

    const newRecord = this.bookStoreBookRepository.create({
      bookStore: { id: storeId },
      book: { id: bookId },
      quantity,
    });

    return await this.bookStoreBookRepository.save(newRecord);
  }

  async removeBook(
    storeId: number,
    bookId: number,
    quantity: number,
  ): Promise<BookStoreBook> {
    this.logger.log(
      `Attempting to remove ${quantity} books(ID: ${bookId}) from store ${storeId}`,
      'BookStoreService',
    );

    await this.findOne(storeId);

    const record = await this.bookStoreBookRepository.findOne({
      where: {
        bookStore: { id: storeId },
        book: { id: bookId },
      },
    });

    if (!record) {
      this.logger.error(
        `Book ${bookId} not found in store ${storeId}`,
        'BookStoreService',
      );
      throw new BookStoreNotFoundException(storeId);
    }

    if (record.quantity < quantity) {
      this.logger.error(
        `Insufficient stock for book ${bookId} in store ${storeId}`,
        'BookStoreService',
      );
      throw new InsufficientStockException(bookId, record.quantity);
    }

    record.quantity -= quantity;

    if (record.quantity === 0) {
      await this.bookStoreBookRepository.remove(record);
      this.logger.log(
        `Removed all copies of book ${bookId} from store ${storeId}`,
        'BookStoreService',
      );
      return null;
    }

    const updatedRecord = await this.bookStoreBookRepository.save(record);
    this.logger.log(
      `Successfully removed ${quantity} books from store ${storeId}`,
      'BookStoreService',
    );
    return updatedRecord;
  }

  async getBookQuantity(storeId: number, bookId: number): Promise<number> {
    await this.findOne(storeId);

    const record = await this.bookStoreBookRepository.findOne({
      where: {
        bookStore: { id: storeId },
        book: { id: bookId },
      },
    });

    return record ? record.quantity : 0;
  }
}
