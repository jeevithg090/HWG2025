import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { AttendeeStatus } from "../enums/eventTypes";
import Model from "./base";
import { Event } from "./event";

@Entity()
@Index(["eventId", "userId"], { unique: true })
export class EventAttendee extends Model {
  @Column()
  eventId!: string;

  @Index()
  @Column()
  userId!: string;

  @Column()
  userEmail!: string;

  @Column({ type: "varchar", nullable: true })
  userName?: string | null;

  @Column({ default: false })
  hasAttended!: boolean;

  @Column({ type: "varchar", default: AttendeeStatus.REGISTERED })
  status!: AttendeeStatus;

  @ManyToOne(() => Event, (event) => event.attendees, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event?: Event;
}
