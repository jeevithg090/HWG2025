import { Router } from "express";
import { currentUser, requireAuth } from "../middleware/auth";
import { UserService } from "../services/userService";
import {
  CreateUserSchema,
  LoginUserSchema,
  UpdateProfileSchema,
} from "../validations/userValidation";

export const createUserRouter = (userService: UserService) => {
  const router = Router();

  router.post("/signup", async (req, res) => {
    const input = CreateUserSchema.parse(req.body);
    const user = await userService.signup(input);
    res.status(201).json({ success: 1, user });
  });

  router.post("/login", async (req, res) => {
    const input = LoginUserSchema.parse(req.body);
    const { token, user } = await userService.login(input);
    res.status(200).json({ success: 1, message: "LOGIN_SUCCESSFUL", token, user });
  });

  router.get("/profile", requireAuth, async (req, res) => {
    const user = await userService.getProfile(currentUser(req).id);
    res.status(200).json({ success: 1, user });
  });

  router.patch("/profile", requireAuth, async (req, res) => {
    const changes = UpdateProfileSchema.parse(req.body);
    const user = await userService.updateProfile(currentUser(req).id, changes);
    res.status(200).json({ success: 1, user });
  });

  // Kept for backwards compatibility: returns the identity embedded in the token.
  router.get("/logged", requireAuth, (req, res) => {
    res.status(200).json({ success: 1, user: currentUser(req) });
  });

  return router;
};
