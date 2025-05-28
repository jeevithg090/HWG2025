import express from "express";
import userRouter from "./routes/userRoutes";
import verifyToken from "./middleware/auth";
import authRouter from "./routes/authRoutes";

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.use(verifyToken);

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.get("/healthcheck", (_, res) => {
  res.status(200);
  res.json({ mesage: "Server is running on desired port", success: 1 });
  res.send();
});

export default app;
