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

import {
    setupPaymentSocket,
} from "./services/payment.flutter.socket.js";

// Load env variables
dotenv.config({
    path: path.resolve(
        process.cwd(),
        ".env",
    ),
});

// Create HTTP server
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Flutter → Node payment socket
setupPaymentSocket(io);

// Make Socket.IO available to Phajay callback
setPaymentSocketServer(io);

// Node → Phajay payment socket
onSubscribePaymentSupport();

const startServer = async () => {
    server.listen(PORT, () => {
        console.log(`🚀 HTTP Server running on port ${PORT}`);
        logger.info(`🚀 HTTP Server running on port ${PORT}`);
    });
};

// Handle graceful shutdown
const shutdown = () => {
    io.close();

    server.close(() => {
        logger.info(
            "Shutting down server...",
        );

        process.exit(0);
    });
};

process.on(
    "SIGTERM",
    shutdown,
);

process.on(
    "SIGINT",
    shutdown,
);

// Start server
startServer();