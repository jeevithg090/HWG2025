import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config/config";
import { AppError } from "../common/errors";
import { AuthUser } from "../middleware/auth";
import { User } from "../models/user";
import { typeormUserRepository, UserRepository } from "../repository/userRepository";
import { CreateUserInput, LoginUserInput, UpdateProfileInput } from "../validations/userValidation";

export type PublicUser = Pick<
  User,
  "id" | "name" | "email" | "type" | "bio" | "skills" | "active" | "createdAt"
>;

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  type: user.type,
  bio: user.bio,
  skills: user.skills,
  active: user.active,
  createdAt: user.createdAt,
});

const toTokenUser = (user: User): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  type: user.type,
});

// Compared against when a login email is unknown so response timing does not
// reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("timing-safe-placeholder", 10);

export class UserService {
  constructor(private readonly users: UserRepository = typeormUserRepository) {}

  async signup(input: CreateUserInput): Promise<PublicUser> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict("USER_EXISTS");
    }
    const password = await bcrypt.hash(input.password, config.bcryptRounds);
    const user = await this.users.create({ ...input, password });
    return toPublicUser(user);
  }

  async login(input: LoginUserInput): Promise<{ token: string; user: AuthUser }> {
    const user = await this.users.findByEmailWithPassword(input.email);
    const valid = await bcrypt.compare(input.password, user?.password ?? DUMMY_HASH);
    if (!user || !user.password || !valid) {
      throw AppError.unauthorized("INVALID_CREDENTIALS");
    }
    if (!user.active) {
      throw AppError.forbidden("ACCOUNT_DISABLED");
    }
    const tokenUser = toTokenUser(user);
    const token = jwt.sign({ user: tokenUser }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
    });
    return { token, user: tokenUser };
  }

  async getProfile(id: string): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) {
      throw AppError.notFound("USER_NOT_FOUND");
    }
    return toPublicUser(user);
  }

  async updateProfile(id: string, changes: UpdateProfileInput): Promise<PublicUser> {
    const user = await this.users.update(id, changes as Partial<User>);
    if (!user) {
      throw AppError.notFound("USER_NOT_FOUND");
    }
    return toPublicUser(user);
  }
}
