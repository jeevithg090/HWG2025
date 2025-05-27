import express from "express";
import { UserService } from "../services/userService";
const authRouter = express.Router();

const userService: UserService = new UserService();

authRouter.get("/verify-token", async (req, res) => {
  const user = (req as any).user;
  res.status(200);
  res.send({
    user: user,
    successs: 1,
  });
});

export default authRouter;
