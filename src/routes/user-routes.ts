import express from "express"
const router = express.Router();

// import controllers and middlewares
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { getMe, updateMe } from "../controllers/user-controller.js";
import { uploadProfile } from "../middlewares/upload-image-middleware.js";

router.get("/me", authMiddleware, getMe);
router.put(
    "/me",
    authMiddleware,
    uploadProfile.single("profile"),
    updateMe,
);

// export router
export default router;
