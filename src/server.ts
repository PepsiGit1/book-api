import app from "./app.js";
import dotenv from "dotenv";
import http from "node:http";
import path from "node:path";
import { Server } from "socket.io";

import logger from "./config/logger.js";
import {
    setPaymentSocketServer,
    onSubscribePaymentSupport,
} from "./services/payment.socket.js";

dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
});

const PORT = Number(process.env.PORT) || 8000;

const server = http.createServer(app);

server.on("request", (req, res) => {
    console.log(
        "🌐 HTTP REQUEST:",
        req.method,
        req.url,
    );
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

setPaymentSocketServer(io);

// This actually opens the connection to Phajay and starts listening
// for their callback event. Without calling this, the app only ever
// sets up the Flutter-facing socket server and never talks to Phajay.
onSubscribePaymentSupport();

io.on("connection", (socket) => {
    console.log(
        "📱 Flutter connected:",
        socket.id,
    );

    socket.on("payment:subscribe", (data) => {
        const transactionId =
            data?.transactionId?.toString();

        if (!transactionId) {
            console.log(
                "❌ Missing transactionId",
            );
            return;
        }

        const room =
            `payment:${transactionId}`;

        socket.join(room);

        console.log(
            "📱 Flutter joined room:",
            room,
        );
    });

    socket.on("disconnect", (reason) => {
        console.log(
            "📱 Flutter disconnected:",
            socket.id,
            reason,
        );
    });
});

server.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `🚀 HTTP Server running on port ${PORT}`,
        );

        logger.info(
            `🚀 HTTP Server running on port ${PORT}`,
        );
    },
);