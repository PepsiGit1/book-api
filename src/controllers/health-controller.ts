import prisma from "../../prisma/prisma-client.js";
import type { NextFunction, Request, Response } from "express";

// app health route
export const appHealthCheck = (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'Application is running'
    });
};


// db health route
export const dbHealthCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Attempt to perform a simple query to check database connection
        await prisma.$queryRaw`SELECT 1`;  

        // Successful database connection
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'Database is healthy and responsive'
        });
    } catch (error: any) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown database connection error'
        });
    }
};