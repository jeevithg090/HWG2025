import { Router } from "express";
import { currentUser, requireAuth } from "../middleware/auth";

/** Lets other services or clients check a token and read the identity inside it. */
export const createAuthRouter = () => {
  const router = Router();

  router.get("/verify-token", requireAuth, (req, res) => {
    res.status(200).json({ success: 1, user: currentUser(req) });
  });

  return router;
};
