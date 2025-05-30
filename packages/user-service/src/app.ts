import express from "express";
import userRouter from "./routes/userRoutes";
import verifyToken from "./middleware/auth";
import authRouter from "./routes/authRoutes";
import cors from "cors"; // Import the cors middleware

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000", // Your local frontend URL
    // If you deploy your frontend, you'll add its production URL(s) here too
    // e.g., 'https://your-production-frontend.com'
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow these HTTP methods
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204, // For preflight requests
};
app.use(cors(corsOptions));

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
