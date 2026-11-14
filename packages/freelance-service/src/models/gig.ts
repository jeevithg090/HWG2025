import { Column, Entity, Index, OneToMany } from "typeorm";
import { GigStatus } from "../enums/gigStatus";
import Model, { decimalTransformer } from "./base";
import { Proposal } from "./proposal";
import { Review } from "./review";

@Entity()
export class Gig extends Model {
  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Index()
  @Column("uuid")
  clientId!: string;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  budget?: number | null;

  @Column("text", { array: true, nullable: true })
  requiredSkills?: string[] | null;

  @Column({ type: "enum", enum: GigStatus, default: GigStatus.OPEN })
  status!: GigStatus;

  @Column({ type: "timestamptz", nullable: true })
  deadline?: Date | null;

  @Column("text", { nullable: true })
  attachmentUrl?: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Proposal, (proposal) => proposal.gig)
  proposals?: Proposal[];

  /** Populated by queries via loadRelationCountAndMap; not a column. */
  proposalCount?: number;

  @OneToMany(() => Review, (review) => review.gig)
  reviews?: Review[];
}
