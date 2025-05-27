import express from "express";
import userRouter from "./routes/userRoutes";

const app = express();

app.use(express.json());
app.use("/user", userRouter);

app.get("/healthcheck", (_, res) => {
  res.status(200);
  res.json({ mesage: "Server is running on desired port", success: 1 });
  res.send();
});

export default app;
