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

  // async remove(id: number) {
  //   const result = await this.bookingsRepository.delete(id);
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Booking with ${id} not found`);
  //   }
  // }
}
