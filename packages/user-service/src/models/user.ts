import { Column, Entity } from "typeorm";
import { UserTypes } from "../enums/userTypes";
import Model from "./base";

@Entity()
export class User extends Model {
  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  // Never selected by default so password hashes cannot leak through generic queries.
  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ default: "local" })
  provider!: string;

  @Column({ nullable: true })
  providerId?: string;

  @Column({
    type: "enum",
    enum: UserTypes,
    default: UserTypes.FREELANCER,
  })
  type!: UserTypes;

  @Column({ type: "simple-array", nullable: true })
  roles?: string[];

  @Column({ type: "text", nullable: true })
  bio?: string;

  @Column("text", { array: true, nullable: true })
  skills?: string[];

  @Column("bool", { default: true })
  active!: boolean;
}
