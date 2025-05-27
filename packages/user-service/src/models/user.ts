// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { UserRole } from "../types/userRoles";
import { UserTypes } from "../enums/userRoles";
import Model from "./base";

@Entity()
export class User extends Model {
  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true }) // Password may be null for OAuth users
  password?: string;

  @Column({ default: "local" }) // 'local', 'google', etc.
  provider!: string;

  @Column({ nullable: true }) // Provider-specific user ID
  providerId?: string;

  @Column({
    type: "enum",
    enum: UserTypes,
    default: UserTypes.FREELANCER,
  })
  role!: UserRole;

  @Column({ nullable: true })
  bio?: string;

  @Column("text", { array: true, nullable: true })
  skills?: string[];

  @Column("bool", { default: true })
  active!: boolean;
}
