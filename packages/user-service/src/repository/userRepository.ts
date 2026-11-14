import { dataSource } from "../database/database";
import { User } from "../models/user";

export interface UserRepository {
  create(user: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  /** Same as findByEmail but includes the (normally hidden) password hash. */
  findByEmailWithPassword(email: string): Promise<User | null>;
  update(id: string, changes: Partial<User>): Promise<User | null>;
}

const repo = () => dataSource.getRepository(User);

export const typeormUserRepository: UserRepository = {
  async create(user) {
    const saved = await repo().save(repo().create(user));
    delete saved.password;
    return saved;
  },
  findById(id) {
    return repo().findOneBy({ id });
  },
  findByEmail(email) {
    return repo().findOneBy({ email });
  },
  findByEmailWithPassword(email) {
    return repo()
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .getOne();
  },
  async update(id, changes) {
    await repo().update(id, changes);
    return repo().findOneBy({ id });
  },
};
