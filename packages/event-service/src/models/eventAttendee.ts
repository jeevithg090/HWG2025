import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import Model from "./base";
import { Event } from "./event";

@Entity()
export class EventAttendee extends Model {
  @Column()
  eventId!: string;

  @Column()
  userId!: string;

  @Column()
  userEmail!: string;

  @Column({ nullable: true })
  userName?: string;

  @Column({ default: false })
  hasAttended!: boolean;
  
  @Column({ default: "REGISTERED" })
  status!: string; // REGISTERED, CANCELLED, WAITLISTED

  @ManyToOne(() => Event, event => event.attendees)
  @JoinColumn({ name: "eventId" })
  event!: Event;
}
