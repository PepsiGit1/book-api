import { io } from 'socket.io-client';
import type { Server } from 'socket.io';
import prisma from '../../prisma/prisma-client.js';

let flutterIo: Server | null = null;

export const setPaymentSocketServer = (ioServer: Server) => {
    flutterIo = ioServer;

    console.log('✅ Flutter payment socket server initialized');
};

export const onSubscribePaymentSupport = () => {
    const secretKey = process.env.PAYMEN_SECREAT;

    if (!secretKey) {
        throw new Error(
            '❌ PHAJAY_SECRET_KEY is not configured',
        );
    }

    const socket = io(
        'https://payment-gateway.phajay.co/',
        {
            transports: ['websocket'],
            reconnection: true,
        },
    );

    socket.on('connect', () => {
        console.log(
            '✅ Connected to Phajay Payment Support!',
        );

        const eventName = `join::${secretKey}`;

        console.log(
            '👂 Listening event:',
            eventName,
        );

        socket.on(eventName, async (data) => {
            console.log(
                '🔥 PHajAY CALLBACK EVENT:',
                eventName,
            );

            console.log(
                JSON.stringify(data, null, 2),
            );

            const transactionId =
                data?.transactionId?.toString();

            const status =
                data?.status?.toString();

            if (!transactionId) {
                console.log(
                    '❌ Missing transactionId from Phajay callback',
                );
                return;
            }

            // THIS WAS MISSING — save the final status to DB.
            // Note: data.userId here is Phajay's own internal id, NOT our
            // User.id, so it is intentionally NOT written to our userId column.
            try {
                await prisma.payment.upsert({
                    where: { transactionId },
                    update: {
                        status: status ?? 'unknown',
                        message: data?.message?.toString() ?? '',
                        paymentMethod: data?.paymentMethod?.toString() ?? undefined,
                        amount: data?.txnAmount ? Number(data.txnAmount) : undefined,
                    },
                    create: {
                        transactionId,
                        status: status ?? 'unknown',
                        message: data?.message?.toString() ?? '',
                        paymentMethod: data?.paymentMethod?.toString() ?? '',
                        amount: data?.txnAmount ? Number(data.txnAmount) : undefined,
                    },
                });

                console.log(`💾 Saved payment status for ${transactionId}: ${status}`);
            } catch (dbError) {
                console.error('❌ Failed to save payment status to DB:', dbError);
            }

            const room = `payment:${transactionId}`;

            console.log(
                `📤 Sending payment status to Flutter room: ${room}`,
            );

            console.log(
                `💰 Payment status: ${status}`,
            );

            flutterIo
                ?.to(room)
                .emit('payment:status', {
                    transactionId,
                    status,
                    message:
                        data?.message?.toString() ?? '',
                    paymentMethod:
                        data?.paymentMethod?.toString() ?? '',
                });
        });
    });

    socket.onAny((event, ...args) => {
        console.log(
            '📡 PHajay EVENT:',
            event,
        );

        console.log(
            '📦 DATA:',
            JSON.stringify(args, null, 2),
        );
    });

    socket.on('connect_error', (error) => {
        console.error(
            '❌ Phajay connection failed:',
            error.message,
        );
    });

    socket.on('disconnect', (reason) => {
        console.log(
            '⚠️ Phajay disconnected:',
            reason,
        );
    });

    return socket;
};