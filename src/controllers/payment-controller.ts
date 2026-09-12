
import { PaymentService } from '../services/payment-service.js';
import type { Request, Response } from "express";

const paymentService = new PaymentService();

export const generateBcelQr = async (
    req: Request,
    res: Response,
) => {
    try {
        const { amount, description } = req.body;

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