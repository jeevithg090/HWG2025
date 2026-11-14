import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ProposalStatus } from "../enums/gigStatus";
import Model, { decimalTransformer } from "./base";
import { Gig } from "./gig";

@Entity()
export class Proposal extends Model {
  @Index()
  @Column("uuid")
  freelancerId!: string;

  @Index()
  @Column("uuid")
  gigId!: string;

  @ManyToOne(() => Gig, (gig) => gig.proposals, { onDelete: "CASCADE" })
  @JoinColumn({ name: "gigId" })
  gig?: Gig;

  @Column("text")
  coverLetter!: string;

  @Column("decimal", { precision: 10, scale: 2, transformer: decimalTransformer })
  bidAmount!: number;

  @Column("integer", { nullable: true })
  estimatedTimeInDays?: number | null;

  @Column({ type: "enum", enum: ProposalStatus, default: ProposalStatus.PENDING })
  status!: ProposalStatus;

  @Column({ default: true })
  isActive!: boolean;
}
