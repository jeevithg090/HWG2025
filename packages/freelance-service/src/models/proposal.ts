// src/models/proposal.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import Model from "./base";
import { ProposalStatus } from "../enums/gigStatus";
import { Gig } from "./gig";

@Entity()
export class Proposal extends Model {
  @Column("uuid")
  freelancerId!: string;

  @Column("uuid")
  gigId!: string;

  @ManyToOne(() => Gig, (gig) => gig.proposals)
  @JoinColumn({ name: "gigId" })
  gig!: Gig;

  @Column("text")
  coverLetter!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  bidAmount!: number;

  @Column("integer", { nullable: true })
  estimatedTimeInDays?: number;

  @Column({
    type: "enum",
    enum: ProposalStatus,
    default: ProposalStatus.PENDING,
  })
  status!: ProposalStatus;

  @Column({ default: true })
  isActive!: boolean;
}
