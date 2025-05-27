import express from "express";
import eventRouter from "./routes/eventRoutes";

const app = express();

app.use(express.json());
app.use("/events", eventRouter);

app.get("/healthcheck", (_, res) => {
  res.status(200);
  res.json({ message: "Event Service is running on desired port", success: 1 });
  res.send();
});

export default app;
