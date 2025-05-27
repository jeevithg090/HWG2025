// src/models/review.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import Model from "./base";
import { Gig } from "./gig";

@Entity()
export class Review extends Model {
  @Column("uuid")
  gigId!: string;

  @ManyToOne(() => Gig, gig => gig.reviews)
  @JoinColumn({ name: "gigId" })
  gig!: Gig;
  
  @Column("uuid")
  reviewerId!: string; // User who is giving the review
  
  @Column("uuid")
  revieweeId!: string; // User who is receiving the review
  
  @Column("integer")
  rating!: number; // 1-5 stars
  
  @Column("text", { nullable: true })
  comment?: string;
}
