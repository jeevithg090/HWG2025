import { Column, Entity } from "typeorm";
import { UserTypes } from "../enums/userTypes";
import Model from "./base";
import { UserRoles } from "../enums/userRoles";

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
  type!: UserTypes;

  @Column({ type: "simple-array", nullable: true, default: [] })
  roles?: string[];

  @Column({ nullable: true })
  bio?: string;

  @Column("text", { array: true, nullable: true })
  skills?: string[];

  @Column("bool", { default: true })
  active!: boolean;
}
