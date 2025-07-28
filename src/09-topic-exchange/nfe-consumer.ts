import * as amqp from "amqplib";

async function start() {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();
    const exchange = "amq.topic";
    const queue = "nfe-consumer";
    const routingKey = "order.paid";

    await channel.assertExchange(exchange, "topic");
    await channel.assertQueue(queue);
    await channel.bindQueue(queue, exchange, routingKey);

    channel.consume(queue, (msg) => {
        if (msg !== null) {
            const content = msg.content.toString();
            console.log(`Received (${msg.fields.routingKey}): ${content}`);
            channel.ack(msg);
        }
    });
}

start();
