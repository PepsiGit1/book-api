import express from "express";
const router = express.Router();

// import controllers and middlewares
import * as authControllers from "../controllers/auth-controller.js";

// define routes
router.route("/login").post(authControllers.loginUser);
router.route("/register").post(authControllers.registerUser);
router.route("/logout").get(authControllers.logoutUser);
router.route("/refresh-token").get(authControllers.refreshAccessToken);

// export router
export default router;
