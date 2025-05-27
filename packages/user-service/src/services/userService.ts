import { User } from "../models/user";
import userRepository from "../repository/userRepository";
import bcrypt from "bcryptjs";
export class UserService {
  public async createUser(userData: Partial<User>) {
    const password = userData.password;
    const encryptedPassword = await bcrypt.hash(password!, 10);
    userData.password = encryptedPassword;
    const newUser = await userRepository.save(userData);
    return newUser;
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    return userRepository.findByEmail(email);
  }
}
