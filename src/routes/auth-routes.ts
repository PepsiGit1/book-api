import express from "express";
const router = express.Router();

// import controllers and middlewares
import * as authControllers from "../controllers/auth-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

// define routes
router.route("/login").post(authControllers.loginUser);
router.route("/register").post(authControllers.registerUser);
router.route("/logout").post(authControllers.logoutUser);
router.route("/refresh-token").post(authControllers.refreshAccessToken);
router.put(
    "/change-password",
    authMiddleware,
    authControllers.changePassword,
);

// export router
export default router;
