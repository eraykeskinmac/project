import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import {
  BookNotFoundException,
  DuplicateEntryException,
} from '../common/exceptions/custom.exception';
import { CustomLogger } from 'src/common/services/logger.service';

describe('BookService', () => {
  let service: BookService;
  let bookRepository: any;

  const mockBookRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
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
        BookService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepository,
        },
        {
          provide: CustomLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    bookRepository = module.get(getRepositoryToken(Book));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw DuplicateEntryException when ISBN exists', async () => {
      const createDto = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '123456789',
        price: 29.99,
      };
      mockBookRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(
        DuplicateEntryException,
      );
      expect(bookRepository.findOne).toHaveBeenCalledWith({
        where: { isbn: createDto.isbn },
      });
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should create book when ISBN is unique', async () => {
      const createDto = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '123456789',
        price: 29.99,
      };
      const mockBook = { ...createDto, id: 1 };

      mockBookRepository.findOne.mockResolvedValue(null);
      mockBookRepository.create.mockReturnValue(mockBook);
      mockBookRepository.save.mockResolvedValue(mockBook);

      const result = await service.create(createDto);

      expect(bookRepository.findOne).toHaveBeenCalled();
      expect(bookRepository.create).toHaveBeenCalledWith(createDto);
      expect(bookRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw BookNotFoundException when book not found', async () => {
      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(BookNotFoundException);
      expect(bookRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return book when found', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        isbn: '123456789',
        price: 29.99,
      };
      mockBookRepository.findOne.mockResolvedValue(mockBook);

      const result = await service.findOne(1);

      expect(bookRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });
});
