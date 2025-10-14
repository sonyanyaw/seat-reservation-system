import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Event } from '../events/event.entity';

@Entity({ name: 'bookings' })
@Unique(['event_id', 'user_id'])
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  event_id: number;

  @Column({ type: 'varchar' })
  user_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Event, (event) => event.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
