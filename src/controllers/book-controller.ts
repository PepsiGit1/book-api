import type { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/prisma-client.js";
import { paginate } from "../utils/pagination.js";

export const getAllBook = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const books = await prisma.book.findMany({
            include: {
                category: true,

                chapters: {
                    orderBy: {
                        chapterNo: "asc",
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data: books,
        });
    } catch (error) {
        next(error);
    }
};

export const getBookById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID",
            });
        }

        const book = await prisma.book.findUnique({
            where: {
                id,
            },

            include: {
                category: true,

                chapters: {
                    orderBy: {
                        chapterNo: "asc",
                    },
                },
            },
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: book,
        });
    } catch (error) {
        next(error);
    }
};

export const createBook = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const {
            title,
            author,
            productId,
            rating,
            categoryId,
            isPremium,
            price,
            chapters,
        } = req.body ?? {};

        if (!title || !productId || !categoryId) {
            return res.status(400).json({
                success: false,
                message:
                    "title, productId and categoryId are required",
            });
        }

        const files = req.files as
            | {
                [fieldname: string]:
                Express.Multer.File[];
            }
            | undefined;

        const coverImageFile =
            files?.coverImage?.[0];

        const audioFiles =
            files?.audioFiles ?? [];

        const subtitleFiles =
            files?.subtitleFiles ?? [];

        const coverImageUrl =
            coverImageFile
                ? `/uploads/${coverImageFile.filename}`
                : null;

        let chapterData: {
            chapterNo: number;
            title: string;
        }[] = [];

        if (chapters) {
            try {
                chapterData =
                    typeof chapters === "string"
                        ? JSON.parse(chapters)
                        : chapters;
            } catch {
                return res.status(400).json({
                    success: false,
                    message:
                        "chapters must be valid JSON",
                });
            }
        }

        if (
            chapterData.length !==
            audioFiles.length
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Number of chapters must match number of audio files",
            });
        }

        if (
            chapterData.length !==
            subtitleFiles.length
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Number of chapters must match number of subtitle files",
            });
        }

        const book = await prisma.book.create({
            data: {
                title,
                author,

                productId,

                coverImageUrl,

                rating:
                    rating !== undefined
                        ? Number(rating)
                        : null,

                categoryId: Number(categoryId),

                isPremium:
                    isPremium === true ||
                    isPremium === "true",

                price:
                    price !== undefined
                        ? Number(price)
                        : 0,

                chapters: {
                    create: chapterData.map(
                        (chapter, index) => {
                            const audioFile =
                                audioFiles[index];

                            const subtitleFile =
                                subtitleFiles[index];

                            if (
                                !audioFile ||
                                !subtitleFile
                            ) {
                                throw new Error(
                                    `Missing files for chapter ${chapter.chapterNo}`,
                                );
                            }

                            return {
                                chapterNo:
                                    Number(
                                        chapter.chapterNo,
                                    ),

                                title: chapter.title,

                                audioUrl:
                                    `/uploads/${audioFile.filename}`,

                                subtitleUrl:
                                    `/uploads/${subtitleFile.filename}`,
                            };
                        },
                    ),
                },
            },

            include: {
                category: true,

                chapters: {
                    orderBy: {
                        chapterNo: "asc",
                    },
                },
            },
        });

        return res.status(201).json({
            success: true,
            message:
                "Book created successfully",
            data: book,
        });
    } catch (error) {
        next(error);
    }
}

export const updateBook = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;

        const {
            title,
            author,
            productId,
            coverImageUrl,
            rating,
            categoryId,
            isPremium,
            price,
            audioUrl,
            subtitleUrl,
        } = req.body;

        const book = await prisma.book.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        const updatedBook = await prisma.book.update({
            where: {
                id: Number(id),
            },
            data: {
                ...(title !== undefined && { title }),
                ...(author !== undefined && { author }),
                ...(productId !== undefined && { productId }),
                ...(coverImageUrl !== undefined && { coverImageUrl }),
                ...(rating !== undefined && { rating: Number(rating) }),
                ...(categoryId !== undefined && {
                    categoryId: Number(categoryId),
                }),
                ...(isPremium !== undefined && {
                    isPremium: Boolean(isPremium),
                }),
                ...(price !== undefined && {
                    price: Number(price),
                }),
                ...(audioUrl !== undefined && { audioUrl }),
                ...(subtitleUrl !== undefined && { subtitleUrl }),
            },
            include: {
                category: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Book updated successfully",
            data: updatedBook,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBook = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;

        const book = await prisma.book.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        await prisma.book.delete({
            where: {
                id: Number(id),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Book deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
export const searchBooks = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { q, categoryId, isPremium, minPrice, maxPrice } = req.query as Record<string, string | undefined>;

        const where: any = {};
        if (q) {
            where.OR = [
                { title: { contains: q, mode: "insensitive" } },
                { author: { contains: q, mode: "insensitive" } },
            ];
        }
        if (categoryId) where.categoryId = Number(categoryId);
        if (isPremium !== undefined) where.isPremium = isPremium === "true";
        if (minPrice || maxPrice) {
            where.price = {
                ...(minPrice && { gte: Number(minPrice) }),
                ...(maxPrice && { lte: Number(maxPrice) }),
            };
        }

        const { data, meta } = await paginate(prisma.book, req, {
            where,
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({ success: true, data, meta });
    } catch (error) {
        next(error);
    }
};