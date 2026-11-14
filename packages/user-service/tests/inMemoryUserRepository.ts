import { randomUUID } from "crypto";
import { UserTypes } from "../src/enums/userTypes";
import { User } from "../src/models/user";
import { UserRepository } from "../src/repository/userRepository";

/** Minimal in-memory stand-in for the TypeORM repository. */
export class InMemoryUserRepository implements UserRepository {
  readonly rows: User[] = [];

  async create(data: Partial<User>): Promise<User> {
    const now = new Date();
    const user = Object.assign(new User(), {
      type: UserTypes.FREELANCER,
      provider: "local",
      active: true,
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
    this.rows.push(user);
    return this.withoutPassword(user);
  }

  async findById(id: string) {
    const user = this.rows.find((row) => row.id === id);
    return user ? this.withoutPassword(user) : null;
  }

  async findByEmail(email: string) {
    const user = this.rows.find((row) => row.email === email);
    return user ? this.withoutPassword(user) : null;
  }

  async findByEmailWithPassword(email: string) {
    return this.rows.find((row) => row.email === email) ?? null;
  }

  async update(id: string, changes: Partial<User>) {
    const user = this.rows.find((row) => row.id === id);
    if (!user) return null;
    Object.assign(user, changes);
    return this.withoutPassword(user);
  }

  private withoutPassword(user: User): User {
    const copy = Object.assign(new User(), user);
    delete copy.password;
    return copy;
  }
}
