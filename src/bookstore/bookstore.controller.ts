import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BookStoreService } from './bookstore.service';
import { CreateBookStoreDto } from './dto/create-bookstore.dto';
import { UpdateBookStoreDto } from './dto/update-bookstore.dto';
import { UpdateBookQuantityDto } from './dto/update-book-quantity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../enums/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookStoreBookParams, IdParam } from 'src/common/dto/params.dto';

@ApiTags('bookstores')
@ApiBearerAuth()
@Controller('bookstores')
@UseGuards(JwtAuthGuard)
export class BookStoreController {
  constructor(private readonly bookStoreService: BookStoreService) {}

  @ApiOperation({ summary: 'Create new bookstore' })
  @ApiResponse({ status: 201, description: 'Bookstore successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  create(@Body() createBookStoreDto: CreateBookStoreDto) {
    return this.bookStoreService.create(createBookStoreDto);
  }

  @ApiOperation({ summary: 'Get all bookstores' })
  @ApiResponse({ status: 200, description: 'Return all bookstores' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll() {
    return this.bookStoreService.findAll();
  }

  @ApiOperation({ summary: 'Get bookstore by ID' })
  @ApiResponse({ status: 200, description: 'Return the bookstore' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Bookstore not found' })
  @Get(':id')
  findOne(@Param() params: IdParam) {
    return this.bookStoreService.findOne(+params.id);
  }
  @ApiOperation({ summary: 'Update bookstore' })
  @ApiResponse({ status: 200, description: 'Bookstore successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Bookstore not found' })
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  update(
    @Param() params: IdParam,
    @Body() updateBookStoreDto: UpdateBookStoreDto,
  ) {
    return this.bookStoreService.update(+params.id, updateBookStoreDto);
  }

  @ApiOperation({ summary: 'Add books to store' })
  @ApiResponse({
    status: 200,
    description: 'Books successfully added to store',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Store Manager only',
  })
  @Post(':storeId/books/:bookId')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.STORE_MANAGER)
  addBook(
    @Param() params: BookStoreBookParams,
    @Body() updateBookQuantityDto: UpdateBookQuantityDto,
  ) {
    return this.bookStoreService.addBook(
      +params.storeId,
      +params.bookId,
      updateBookQuantityDto.quantity,
    );
  }

  @ApiOperation({ summary: 'Remove books from store' })
  @ApiResponse({
    status: 200,
    description: 'Books successfully removed from store',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Store Manager only',
  })
  @Delete(':storeId/books/:bookId')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.STORE_MANAGER)
  removeBook(
    @Param() params: BookStoreBookParams,
    @Body() updateBookQuantityDto: UpdateBookQuantityDto,
  ) {
    return this.bookStoreService.removeBook(
      +params.storeId,
      +params.bookId,
      updateBookQuantityDto.quantity,
    );
  }

  @ApiOperation({ summary: 'Get book quantity in store' })
  @ApiResponse({ status: 200, description: 'Return the book quantity' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':storeId/books/:bookId/quantity')
  getBookQuantity(@Param() params: BookStoreBookParams) {
    return this.bookStoreService.getBookQuantity(
      +params.storeId,
      +params.bookId,
    );
  }
}
