import { UserTypes } from "../enums/userTypes";

export type CreateUserInput = {
  name: string;
  email: string;
  type?: UserTypes;
  bio?: string;
  skills?: string[];
  active?: boolean;
};
