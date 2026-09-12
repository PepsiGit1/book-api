import PubNub from 'pubnub';

const pubnub = new PubNub({
    publishKey: process.env.PUBNUB_PUBLISH_KEY!,
    subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY!,
    userId: 'books-online-server',
});

export const publishPaymentStatus = async ({
    transactionId,
    status,
    message,
}: {
    transactionId: string;
    status: string;
    message?: string | null;
}) => {
    const channel = `payment.${transactionId}`;

    await pubnub.publish({
        channel,
        message: {
            transactionId,
            status,
            message: message ?? null,
        },
    });

    console.log(
        `PubNub published: ${channel} -> ${status}`,
    );
};