import { PaymentService } from '../services/payment-service.js';
import type { NextFunction, Request, Response } from "express";
import { paginate } from '../utils/pagination.js';
import prisma from '../../prisma/prisma-client.js';

const paymentService = new PaymentService();

export const generateBcelQr = async (
    req: Request,
    res: Response,
) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user?.id;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required',
            });
        }

        const result = await paymentService.generateBcelQr({
            amount: Number(amount),
            description: description ?? 'Books Online',
        });

        if (result?.transactionId) {
            await prisma.payment.upsert({
                where: { transactionId: result.transactionId },
                update: {
                    status: 'pending',
                    amount: Number(amount),
                    paymentMethod: 'BCEL',
                    ...(userId && { userId }),
                },
                create: {
                    transactionId: result.transactionId,
                    status: 'pending',
                    amount: Number(amount),
                    paymentMethod: 'BCEL',
                    ...(userId && { userId }),
                },
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error(
            'BCEL payment error:',
            error.response?.data ?? error.message,
        );

        return res.status(
            error.response?.status ?? 500,
        ).json({
            success: false,
            message:
                error.response?.data?.message ??
                error.message ??
                'Payment failed',
        });
    }
};

export const generateJdbQr = async (
    req: Request,
    res: Response,
) => {
    try {
        const {
            amount,
            description,
        } = req.body;
        const userId = req.user?.id;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        const result =
            await paymentService.generateJDBQr({
                amount: Number(amount),
                description:
                    description ??
                    "Books Online",
            });

        if (result?.transactionId) {
            await prisma.payment.upsert({
                where: { transactionId: result.transactionId },
                update: {
                    status: 'pending',
                    amount: Number(amount),
                    paymentMethod: 'JDB',
                    ...(userId && { userId }),
                },
                create: {
                    transactionId: result.transactionId,
                    status: 'pending',
                    amount: Number(amount),
                    paymentMethod: 'JDB',
                    ...(userId && { userId }),
                },
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error(
            "JDB payment error:",
            error.response?.data ??
            error.message,
        );

        return res.status(
            error.response?.status ?? 500,
        ).json({
            success: false,
            message:
                error.response?.data?.message ??
                error.message ??
                "Payment failed",
        });
    }
};

export const getPaymentHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { status } = req.query as Record<string, string | undefined>;
        const userId = req.user?.id;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        // Scope to the logged-in user now that authMiddleware sets req.user.
        if (userId) {
            where.userId = userId;
        }

        const { data, meta } = await paginate(prisma.payment, req, {
            where,
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data,
            meta,
        });
    } catch (error) {
        next(error);
    }
};

export const getMyTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { status } = req.query as Record<string, string | undefined>;

        const where: any = { userId };

        if (status) {
            where.status = status;
        }

        const { data, meta } = await paginate(prisma.payment, req, {
            where,
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data,
            meta,
        });
    } catch (error) {
        next(error);
    }
};

export const getTransactionsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId } = req.params;
        const { status } = req.query as Record<string, string | undefined>;

        const where: any = { userId };

        if (status) {
            where.status = status;
        }

        const { data, meta } = await paginate(prisma.payment, req, {
            where,
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data,
            meta,
        });
    } catch (error) {
        next(error);
    }
};