import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { User } from "../models/user";
import { UserService } from "../services/userService";
import {
  CreateUserSchema,
  LoginUserSchema,
} from "../validations/userValidation";
import responseStatusMap from "../constants/responseMapping";
const userRouter = express.Router();

const userService: UserService = new UserService();

userRouter.post("/signup", async (req, res) => {
  try {
    const reqBody = req.body;
    CreateUserSchema.parse(reqBody);
    const existingUser = await userService.findUserByEmail(reqBody.email!);
    if (existingUser) {
      throw new Error("USER_EXISTS");
    }
    const newUser = await userService.createUser(reqBody as User);
    const user = {
      id: newUser?.id,
      name: newUser.name,
      email: newUser.email,
      type: newUser.type,
    };
    res.status(200);
    res.send({ success: 1, user: user });
  } catch (error: any) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap?.[errorMessage] || 500;
    res.status(status);
    res.send({ success: 0, message: errorMessage });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const reqBody = req.body;
    LoginUserSchema.parse(reqBody);
    const { email, password } = req.body;
    const existingUser = await userService.findUserByEmail(email!);
    if (!existingUser) {
      throw new Error("INVALID_CREDENTIALS");
    }
    const passwordVerification = await bcrypt.compare(
      password,
      existingUser?.password!
    );
    if (!passwordVerification) {
      throw new Error("INVALID_CREDENTIALS");
    }
    const user = {
      id: existingUser?.id,
      name: existingUser.name,
      email: existingUser.email,
      type: existingUser.type,
    };
    const token = jwt.sign(
      {
        user,
      },
      config.jwt_token_key!,
      { expiresIn: 3600 }
    );
    res.status(200);
    res.send({
      message: "LOGGIN_SUCCESSFUL",
      successs: 1,
      token,
      user,
    });
  } catch (error: any) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(status);
    res.send({ success: 0, message: errorMessage });
  }
});

userRouter.get("/logged", async (req, res) => {
  const user = (req as any).user;
  res.status(200);
  res.send({
    user: user,
    successs: 1,
  });
});

export default userRouter;
