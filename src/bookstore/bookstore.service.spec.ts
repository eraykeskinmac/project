import { Test, TestingModule } from '@nestjs/testing';
import { BookStoreService } from './bookstore.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookStore } from '../entities/bookstore.entity';
import { BookStoreBook } from '../entities/bookstore-book.entity';
import {
  BookStoreNotFoundException,
  InsufficientStockException,
} from '../common/exceptions/custom.exception';
import { CustomLogger } from 'src/common/services/logger.service';

describe('BookStoreService', () => {
  let service: BookStoreService;
  let bookStoreRepository: any;
  let bookStoreBookRepository: any;

  const mockBookStoreRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockBookStoreBookRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookStoreService,
        {
          provide: getRepositoryToken(BookStore),
          useValue: mockBookStoreRepository,
        },
        {
          provide: getRepositoryToken(BookStoreBook),
          useValue: mockBookStoreBookRepository,
        },
        {
          provide: CustomLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<BookStoreService>(BookStoreService);
    bookStoreRepository = module.get(getRepositoryToken(BookStore));
    bookStoreBookRepository = module.get(getRepositoryToken(BookStoreBook));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw BookStoreNotFoundException when bookstore not found', async () => {
      mockBookStoreRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        BookStoreNotFoundException,
      );
      expect(bookStoreRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['books', 'books.book'],
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return bookstore when found', async () => {
      const mockBookStore = {
        id: 1,
        name: 'Test Store',
        address: 'Test Address',
        books: [],
      };
      mockBookStoreRepository.findOne.mockResolvedValue(mockBookStore);

      const result = await service.findOne(1);

      expect(bookStoreRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockBookStore);
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });

  describe('addBook', () => {
    it('should update quantity when book already exists in store', async () => {
      const existingRecord = {
        id: 1,
        bookStore: { id: 1 },
        book: { id: 1 },
        quantity: 5,
      };

      mockBookStoreRepository.findOne.mockResolvedValue({ id: 1 });
      mockBookStoreBookRepository.findOne.mockResolvedValue(existingRecord);
      mockBookStoreBookRepository.save.mockImplementation((input) => input);

      const result = await service.addBook(1, 1, 3);

      expect(bookStoreBookRepository.save).toHaveBeenCalled();
      expect(result.quantity).toBe(8);
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });

  describe('removeBook', () => {
    it('should throw InsufficientStockException when not enough stock', async () => {
      const record = {
        quantity: 5,
        bookStore: { id: 1 },
        book: { id: 1 },
      };

      mockBookStoreRepository.findOne.mockResolvedValue({ id: 1 });
      mockBookStoreBookRepository.findOne.mockResolvedValue(record);

      await expect(service.removeBook(1, 1, 10)).rejects.toThrow(
        InsufficientStockException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should remove book when quantity reaches zero', async () => {
      const record = {
        quantity: 5,
        bookStore: { id: 1 },
        book: { id: 1 },
      };

      mockBookStoreRepository.findOne.mockResolvedValue({ id: 1 });
      mockBookStoreBookRepository.findOne.mockResolvedValue(record);
      mockBookStoreBookRepository.remove.mockResolvedValue(record);

      const result = await service.removeBook(1, 1, 5);

      expect(bookStoreBookRepository.remove).toHaveBeenCalled();
      expect(result).toBeNull();
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });
});
