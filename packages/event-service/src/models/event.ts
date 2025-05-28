import { Column, Entity, OneToMany } from "typeorm";
import { EventTypes } from "../enums/eventTypes";
import Model from "./base";
import { EventAttendee } from "./eventAttendee";

@Entity()
export class Event extends Model {
  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column()
  startDateTime!: Date;

  @Column({ nullable: true })
  endDateTime?: Date;

  @Column({ nullable: true })
  venue?: string;

  @Column({ nullable: true })
  onlineLink?: string;

  @Column({
    type: "enum",
    enum: EventTypes,
    default: EventTypes.MEETUP,
  })
  eventType!: EventTypes;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isPublished!: boolean;

  @Column({ nullable: true })
  maxAttendees?: number;

  @Column({ default: 0 })
  currentAttendees!: number;

  @Column({ nullable: true })
  organizerId?: string;

  @Column({ nullable: true })
  coverImage?: string;

  @Column("text", { array: true, nullable: true })
  tags?: string[];

  @OneToMany(() => EventAttendee, (attendee) => attendee.event)
  attendees?: EventAttendee[];
}
