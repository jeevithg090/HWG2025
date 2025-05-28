import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config";
import responseStatusMap from "../constants/responseMapping";
import whitelistedAPIs from "../constants/whitelistedAPIs";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (whitelistedAPIs.includes(req.path)) {
      console.log(`${req.path} is whitelisted`);
    } else {
      const bearer_token = req.headers["authorization"];
      if (!bearer_token) {
        throw new Error("AUTHENTICATION_FAILED");
      }
      const auth_token = bearer_token.split(" ")[1];
      const decoded = jwt.verify(
        auth_token,
        config.jwt_token_key!
      ) as JwtPayload;
      (req as any).user = decoded.user || {};
    }
    next();
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap?.[errorMessage] || status;
    res.status(status);
    res.send({ success: 0, message: errorMessage });
  }
};

export default verifyToken;
