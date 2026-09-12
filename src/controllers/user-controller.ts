import fs from 'fs';
import type { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/prisma-client.js";
import ErrorHandler from "../utils/error-handler.js";
import path from "path";

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                imageProfile: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Get current user successfully",
            data: user,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updateMe = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new ErrorHandler(
                401,
                "Unauthorized",
            );
        }

        const { name } = req.body;

        if (
            name !== undefined &&
            typeof name !== "string"
        ) {
            throw new ErrorHandler(
                400,
                "Name must be a string",
            );
        }

        const currentUser =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    imageProfile: true,
                },
            });

        if (!currentUser) {
            throw new ErrorHandler(
                404,
                "User not found",
            );
        }

        let imageProfile =
            currentUser.imageProfile;

        if (req.file) {
            if (
                currentUser.imageProfile &&
                currentUser.imageProfile.includes(
                    "/uploads/profiles/",
                )
            ) {
                const oldFileName =
                    path.basename(
                        currentUser.imageProfile,
                    );

                const oldFilePath = path.join(
                    process.cwd(),
                    "uploads",
                    "profiles",
                    oldFileName,
                );

                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            imageProfile = `${req.protocol}://${req.get(
                "host",
            )}/uploads/profiles/${req.file.filename}`;
        }

        const user = await prisma.user.update({
            where: {
                id: userId,
            },

            data: {
                ...(name !== undefined && {
                    name: name.trim(),
                }),

                ...(req.file && {
                    imageProfile,
                }),
            },

            select: {
                id: true,
                name: true,
                email: true,
                imageProfile: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: user,
        });
    } catch (error) {
        if (req.file) {
            const filePath = path.join(
                process.cwd(),
                "uploads",
                "profiles",
                req.file.filename,
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        next(error);
    }
};