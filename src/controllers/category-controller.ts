import type { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/prisma-client.js";

export const getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                name: "asc",
            },
        });

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                books: true,
            },
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { name } = req.body ?? {};

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "name is required",
            });
        }

        const category = await prisma.category.create({
            data: {
                name,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error: any) {
        // Unique constraint violation (duplicate category name)
        if (error?.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A category with this name already exists",
            });
        }
        next(error);
    }
};

export const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const { name } = req.body ?? {};

        const category = await prisma.category.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const updatedCategory = await prisma.category.update({
            where: {
                id: Number(id),
            },
            data: {
                ...(name !== undefined && { name }),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory,
        });
    } catch (error: any) {
        if (error?.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A category with this name already exists",
            });
        }
        next(error);
    }
};

export const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                books: true,
            },
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        if (category.books.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Cannot delete category with existing books. Reassign or delete those books first.",
            });
        }

        await prisma.category.delete({
            where: {
                id: Number(id),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};