import * as amqp from "amqplib";

interface OrderEvent {
    id: string;
    customer: string;
    event: string;
}

async function sendOrderEvents() {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    const exchange = "amq.direct";
    await channel.assertExchange(exchange, "direct");

    const ordersEvent: OrderEvent[] = [
        { id: "1", customer: "Alice", event: "order.created" },
        { id: "2", customer: "Bob", event: "order.updated" },
        { id: "3", customer: "Charlie", event: "order.deleted" }
    ];

    for (let i = 0; i < ordersEvent.length; i++) {
        const order = ordersEvent[i];
        const message = JSON.stringify(order);
        const routingKey = order.event;

        channel.publish(exchange, routingKey, Buffer.from(message));
    }

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

sendOrderEvents().catch(console.error);