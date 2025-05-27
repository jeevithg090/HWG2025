import express, { Request, Response } from "express";
const userRouter = express.Router();

import { CreateUserSchema } from "../validations/userValidation";
import { UserService } from "../services/userService";
import { User } from "../models/user";

const userService: UserService = new UserService();

userRouter.post("/signup", async (req, res) => {
  try {
    const reqBody = req.body;
    CreateUserSchema.parse(reqBody); // throws on invalid input
    const existingUser = await userService.findUserByEmail(reqBody.email!);
    if (existingUser) {
      throw new Error("USER_EXISTS");
    }
    const newUser = await userService.createUser(reqBody as User);
    res.status(200);
    res.send({ success: 1, user: newUser });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR"; // Default error message
    let status: number = 500; // Default status code

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // status = responseStatusMap?.[errorMessage] || 500;
    res.status(status);
    res.send({ success: 0, message: errorMessage });
  }
});
export default userRouter;
