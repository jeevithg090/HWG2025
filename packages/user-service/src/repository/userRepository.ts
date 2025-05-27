import { Repository } from "typeorm";
import DatabaseConnection from "../database/database";
import { User } from "../models/user";

class UserRepository {
  private static _instance: UserRepository;
  private repository!: Repository<User>;
  private initialized = false;

  public static getInstance(): UserRepository {
    if (!UserRepository._instance) {
      UserRepository._instance = new UserRepository();
    }
    return UserRepository._instance;
  }

  private async initRepository() {
    if (!this.initialized) {
      const dataSource = await DatabaseConnection.getInstance().getDataSource();
      this.repository = dataSource.getRepository(User);
      this.initialized = true;
    }
  }

  public async save(user: Partial<User>): Promise<User> {
    await this.initRepository();
    return this.repository.save(user);
  }

  public async findById(id: string): Promise<User | null> {
    await this.initRepository();
    return this.repository.findOneBy({ id });
  }

  public async findByEmail(email: string): Promise<User | null> {
    await this.initRepository();
    return this.repository.findOneBy({ email });
  }

  public async findAll(): Promise<User[]> {
    await this.initRepository();
    return this.repository.find();
  }
}

export default UserRepository.getInstance();
