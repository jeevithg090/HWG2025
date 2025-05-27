import { UserRole } from "./userRoles";

export type CreateUserInput = {
  name: string;
  email: string;
  role?: UserRole;
  bio?: string;
  skills?: string[];
  active?: boolean;
};
