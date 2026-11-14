import { Column, Entity, Index, OneToMany } from "typeorm";
import { EventTypes } from "../enums/eventTypes";
import Model from "./base";
import { EventAttendee } from "./eventAttendee";

@Entity()
export class Event extends Model {
  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Index()
  @Column({ type: "timestamptz" })
  startDateTime!: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDateTime?: Date | null;

  @Column({ type: "varchar", nullable: true })
  venue?: string | null;

  @Column({ type: "varchar", nullable: true })
  onlineLink?: string | null;

  @Column({ type: "enum", enum: EventTypes, default: EventTypes.MEETUP })
  eventType!: EventTypes;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: true })
  isPublished!: boolean;

  @Column({ type: "integer", nullable: true })
  maxAttendees?: number | null;

  /** Number of REGISTERED (not waitlisted) attendees, kept in sync by EventService. */
  @Column({ default: 0 })
  currentAttendees!: number;

  @Index()
  @Column({ type: "varchar", nullable: true })
  organizerId?: string | null;

  @Column({ type: "varchar", nullable: true })
  coverImage?: string | null;

  @Column("text", { array: true, nullable: true })
  tags?: string[] | null;

  @OneToMany(() => EventAttendee, (attendee) => attendee.event)
  attendees?: EventAttendee[];
}
