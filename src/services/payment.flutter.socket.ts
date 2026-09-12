import type { Server } from "socket.io";

export const setupPaymentSocket = (
    io: Server,
) => {
    io.on("connection", (socket) => {
        console.log(
            "📱 Flutter connected:",
            socket.id,
        );

        socket.on(
            "payment:subscribe",
            ({
                transactionId,
            }: {
                transactionId?: string;
            }) => {
                if (
                    !transactionId ||
                    transactionId.trim().length === 0
                ) {
                    console.log(
                        "❌ Missing transactionId",
                    );

                    return;
                }

                const room =
                    `payment:${transactionId}`;

                socket.join(room);

                console.log(
                    `📱 Flutter joined: ${room}`,
                );
            },
        );

        socket.on(
            "disconnect",
            (reason) => {
                console.log(
                    "📱 Flutter disconnected:",
                    socket.id,
                    reason,
                );
            },
        );
    });
};