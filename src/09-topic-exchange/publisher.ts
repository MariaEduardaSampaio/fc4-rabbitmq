import * as amqp from "amqplib";

const EXCHANGE_NAME = "amq.topic";

type OrderEvent = {
    id: number;
    status: string;
    shippingType?: string;
    createdAt: string;
};

async function publishMessages() {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic");

    const now = new Date().toISOString();

    const events: Array<{ routingKey: string; message: OrderEvent }> = [
        { routingKey: "order.created", message: { id: 1, status: "created", createdAt: now } },
        { routingKey: "order.paid", message: { id: 1, status: "paid", createdAt: now } },
        { routingKey: "order.shipped.economy", message: { id: 1, status: "shipped", shippingType: "economy", createdAt: now } },
        { routingKey: "order.shipped.express", message: { id: 2, status: "shipped", shippingType: "express", createdAt: now } },
    ];

    for (const event of events) {
        channel.publish(EXCHANGE_NAME, event.routingKey, Buffer.from(JSON.stringify(event.message)));
    }

    setTimeout(() => {
        channel.close();
        connection.close();
    }, 500);
}

publishMessages();
