import { Router } from 'express';
import {
    generateBcelQr,
    generateJdbQr,
    getMyTransactions,
    getPaymentHistory,
    getTransactionsByUserId,
} from '../controllers/payment-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const router = Router();

router.post('/bcel', authMiddleware, generateBcelQr);
router.post('/jdb', authMiddleware, generateJdbQr);

// Specific/static paths first
router.get('/history', getPaymentHistory);
router.get('/me', authMiddleware, getMyTransactions);
router.get('/history/:userId', getTransactionsByUserId);

export default router;