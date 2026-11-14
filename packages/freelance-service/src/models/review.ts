import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import Model from "./base";
import { Gig } from "./gig";

@Entity()
@Index(["gigId", "reviewerId"], { unique: true, where: '"deletedAt" IS NULL' })
export class Review extends Model {
  @Column("uuid")
  gigId!: string;

  @ManyToOne(() => Gig, (gig) => gig.reviews, { onDelete: "CASCADE" })
  @JoinColumn({ name: "gigId" })
  gig?: Gig;

  /** User giving the review. */
  @Column("uuid")
  reviewerId!: string;

  /** User receiving the review. */
  @Index()
  @Column("uuid")
  revieweeId!: string;

  /** 1–5 stars. */
  @Column("integer")
  rating!: number;

  @Column("text", { nullable: true })
  comment?: string | null;
}
