import type {
    NextFunction,
    Request,
    Response,
} from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access token is required",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is required",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!,
        );

        if (
            typeof decoded === "string" ||
            typeof decoded.userId !== "string"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token",
            });
        }

        req.user = {
            id: decoded.userId,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
        });
    }
};


export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, "Current password is required"),

    newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters"),
});