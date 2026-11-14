export enum UserTypes {
  FREELANCER = "freelancer",
  CLIENT = "client",
  STARTUP = "startup",
  ADMIN = "admin",
}

/** Account types a user may choose for themselves at sign-up. */
export const SELF_ASSIGNABLE_USER_TYPES = [
  UserTypes.FREELANCER,
  UserTypes.CLIENT,
  UserTypes.STARTUP,
] as const;
