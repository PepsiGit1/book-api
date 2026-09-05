import { Router } from "express";
import userRouter from "./routes/user-routes.js";
import healthRouter from "./routes/health-routes.js";
import authRouter from "./routes/auth-routes.js";

const router: Router = Router();

// v1 routes
const v1Routes: Router = Router();
v1Routes.use("/health", healthRouter);
v1Routes.use("/user", userRouter);
v1Routes.use("/auth", authRouter);

// attach v1 routes
router.use("/api/v1", v1Routes);

export default router;
    