import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('reserve')
  @ApiOperation({ summary: 'Забронировать' })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все брони' })
  FindAll() {
    return this.bookingsService.findAll();
  }

  @Get('user')
  @ApiOperation({ summary: 'Получить бронирования пользователя' })
  FindByUserId(@Query('user_id') user_id: string) {
    // if (!user_id || isNaN(Number(user_id))) {
    //   throw new BadRequestException('user_id must be a numeric string');
    // }
    return this.bookingsService.findByUserId(user_id);
  }

  @Get('event/:event_id')
  @ApiOperation({ summary: 'Получить бронирования события' })
  FindByEventId(@Param('event_id', ParseIntPipe) event_id: number) {
    return this.bookingsService.findByEventId(event_id);
  }

  @Get('booking/:id')
  @ApiOperation({ summary: 'Получить бронирование по id' })
  FindOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @Get('top-users')
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    example: 'month',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: String,
    example: new Date().getFullYear(),
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: String,
    example: new Date().getMonth() + 1,
  })
  @ApiQuery({
    name: 'day',
    required: false,
    type: String,
    example: new Date().getDate(),
  })
  getTopUsers(
    @Query('period')
    period: 'day' | 'week' | 'month',
    @Query('year')
    year: string,
    @Query('month')
    month: string,
    @Query('day')
    day: string,
  ) {
    console.log(period, year, month, day);
    const intYear = year ? parseInt(year, 10) : new Date().getFullYear();
    const intMonth = month ? parseInt(month, 10) : new Date().getMonth();
    const intDay = day ? parseInt(day, 10) : new Date().getDate();
    return this.bookingsService.getTopUsers(period, intYear, intMonth, intDay);
  }

  // @Delete(':id')
  // delete(@Param('id', ParseIntPipe) id: number) {
  //   return this.bookingsService.remove(id);
  // }
}
