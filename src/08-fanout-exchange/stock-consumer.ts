import * as amqp from "amqplib";

const QUEUE_NAME = "stock-queue";

export async function startStockConsumer() {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    const exchange = "amq.fanout";

    await channel.assertExchange(exchange, "fanout");
    await channel.assertQueue(QUEUE_NAME);
    await channel.bindQueue(QUEUE_NAME, exchange, "");

    console.log(`Waiting for messages in queue: ${QUEUE_NAME}. To exit press CTRL+C`);

    channel.consume(QUEUE_NAME, (msg) => {
        if (msg !== null) {
            const content = msg.content.toString();
            console.log(`Received order for stock update: ${content}`);

            // Simulate stock update processing
            channel.ack(msg);
        }
    });
}

startStockConsumer().catch(console.error);