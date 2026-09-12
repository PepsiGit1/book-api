import axios from 'axios';

export interface GenerateBcelQrParams {
    amount: number;
    description: string;
}

export class PaymentService {
    async generateBcelQr({
        amount,
        description,
    }: GenerateBcelQrParams) {
        const response = await axios.post(
            process.env.BCEL_URL!,
            {
                amount,
                description,
            },
            {
                headers: {
                    secretKey: process.env.PAYMEN_SECREAT!,
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data;
    }
    async generateJDBQr({
        amount,
        description,
    }: GenerateBcelQrParams) {
        const response = await axios.post(
            process.env.JDB_URL!,
            {
                amount,
                description,
            },
            {
                headers: {
                    secretKey: process.env.PAYMEN_SECREAT!,
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data;
    }
}