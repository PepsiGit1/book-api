import { Router } from 'express';
import { generateBcelQr, generateJdbQr } from '../controllers/payment-controller.js';

const router = Router();

router.post('/bcel', generateBcelQr);

router.post("/jdb", generateJdbQr,);

export default router;