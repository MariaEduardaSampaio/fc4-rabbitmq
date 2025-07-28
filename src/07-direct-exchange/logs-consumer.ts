import * as amqp from "amqplib";

async function logsConsumer() {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    const exchange = "amq.direct";
    const queue = "logs-queue";
    const routingKey = ["order.created", "order.updated"];

    await channel.assertExchange(exchange, "direct");
    await channel.assertQueue(queue);
    await Promise.all(
        routingKey.map(key => channel.bindQueue(queue, exchange, key))
    );

    console.log(`Waiting for messages in queue: ${queue}. To exit press CTRL+C`);

    channel.consume(queue, (msg) => {
        if (msg !== null) {
            const content = msg.content.toString();
            console.log(`[logs-queue] Received: ${content}`);

            channel.ack(msg);
        }
    });
}

logsConsumer().catch(console.error);