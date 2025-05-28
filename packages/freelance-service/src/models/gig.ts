// src/models/gig.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import Model from "./base";
import { GigStatus } from "../enums/gigStatus";
import { Proposal } from "./proposal";
import { Review } from "./review";

@Entity()
export class Gig extends Model {
  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column("uuid")
  clientId!: string;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  budget?: number;

  @Column("text", { array: true, nullable: true })
  requiredSkills?: string[];

  @Column({
    type: "enum",
    enum: GigStatus,
    default: GigStatus.OPEN,
  })
  status!: GigStatus;

  @Column({ nullable: true })
  deadline?: Date;

  @Column("text", { nullable: true })
  attachmentUrl?: string;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Proposal, (proposal) => proposal.gig)
  proposals!: Proposal[];

  @OneToMany(() => Review, (review) => review.gig)
  reviews!: Review[];
}
