import dotenv from "dotenv";
dotenv.config();
import { Server } from "./serverClass";

const server = new Server();

server.start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
