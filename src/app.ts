import { Request, Response, Express, urlencoded } from "express";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { stream } from "winston";
import morgan from "morgan";
import logger from "./utils/logger";
import { errorHandler } from "./middleware/ErrorHandler.middleware";
import { authRoutes } from "./routes/user.route";
import { projectRoutes } from "./routes/project.routes";
import { ShareRoutes } from "./routes/share.routes.";
import { circuitRoutes } from "./routes/circuit.routes";
import { jwtVerify } from "./middleware/verify.middleware";

const app: Express = express();

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: any) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(urlencoded({ extended: true, limit: "1mb" }));
const ALLOWED_ORIGINS: string[] = [
  process.env.CLIENT_URL as string,
  "http://localhost:5173",
];

app.use(
  cors({
    origin:ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/project",jwtVerify,projectRoutes);
app.use("/api/v1/share",ShareRoutes);
app.use("/api/v1/circuit",circuitRoutes);
app.use(errorHandler);

export default app;
