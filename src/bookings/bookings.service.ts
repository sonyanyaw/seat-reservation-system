import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Event } from '../events/event.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,

    private dataSource: DataSource,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { event_id, user_id } = createBookingDto;

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const event = await transactionalEntityManager.findOne(Event, {
        where: { id: event_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) {
        throw new NotFoundException(`Event with id ${event_id} not found`);
      }

      const existing = await transactionalEntityManager.findOne(Booking, {
        where: { event_id, user_id },
      });

      if (existing) {
        throw new ConflictException(
          'User has already booked a seat for this event',
        );
      }

      const bookedCount = await transactionalEntityManager.count(Booking, {
        where: { event_id },
      });

      if (bookedCount >= event.total_seats) {
        throw new BadRequestException('No seats left');
      }

      const booking = transactionalEntityManager.create(Booking, {
        event_id,
        user_id,
      });

      return await transactionalEntityManager.save(booking);
    });
  }

  async findAll(): Promise<Booking[]> {
    return await this.bookingsRepository.find({
      relations: ['event'],
    });
  }

  async findByUserId(user_id: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { user_id },
      relations: ['event'],
    });
  }

  async findByEventId(event_id: number): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { event_id },
      relations: ['event'],
    });
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['event'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async getTopUsers(
    period: 'day' | 'week' | 'month',
    year: number,
    month: number,
    day: number,
  ): Promise<{ user_id: string; place: number; bookings_count: number }[]> {
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'day':
        if (day === undefined) throw new BadRequestException('Day is required');
        startDate = new Date(year, month - 1, day);
        endDate = new Date(year, month - 1, day + 1);
        break;
      case 'week':
        if (day === undefined || month === undefined)
          throw new BadRequestException('Day and month are required');
        startDate = new Date(year, month - 1, day - 6);
        endDate = new Date(year, month - 1, day + 1);
        break;
      case 'month':
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
        break;
      default:
        throw new BadRequestException('Invalid period');
    }

    const results = await this.bookingsRepository
      .createQueryBuilder('booking')
      .select('booking.user_id', 'user_id')
      .addSelect('COUNT(booking.id)', 'bookings_count')
      .where('booking.created_at >= :startDate', { startDate })
      .andWhere('booking.created_at < :endDate', { endDate })
      .groupBy('booking.user_id')
      .orderBy('bookings_count', 'DESC')
      .limit(10)
      .getRawMany();

    return results.map((row, index) => ({
      user_id: row.user_id as string,
      place: index + 1,
      bookings_count: parseInt(row.bookings_count as string, 10),
    }));
  }

  // return this.bookingsRepository.count({
  //   where: {
  //     created_at: MoreThanOrEqual(forMonth),
  //   },
  // });
  // }
}
