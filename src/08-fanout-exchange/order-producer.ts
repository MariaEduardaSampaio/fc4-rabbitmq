import * as amqp from "amqplib";

const EXCHANGE_NAME = "amq.fanout";

type Order = {
    id: number;
    customerName: string;
    items: Array<{ productId: number; quantity: number }>;
    total: number;
    createdAt: string;
}

export async function publishOrder(order: Order) {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "fanout");

    channel.publish(EXCHANGE_NAME, "", Buffer.from(JSON.stringify(order)));

    console.log(`Order published: ${JSON.stringify(order)}`);

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

export async function createAndPublishOrder(data: {
    customerName: string;
    items: Array<{ productId: number; quantity: number }>;
    total: number;
}) {
    const { customerName, items, total } = data;
    const order = {
        id: Math.floor(Math.random() * 100000),
        customerName,
        items,
        total,
        createdAt: new Date().toISOString()
    }

    await publishOrder(order);
}

const orderData = {
    customerName: "John Doe",
    items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
    ],
    total: 100.00
}

createAndPublishOrder(orderData)
    .then(() => console.log("Order published successfully"))
    .catch((error) => console.error("Error publishing order:", error));