import * as amqp from "amqplib";

async function consume() {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    const exchange = "amq.headers";
    const queue = "video-queue";

    await channel.assertExchange(exchange, "headers");
    await channel.assertQueue(queue);

    await channel.bindQueue(queue, exchange, "", {
        "type": "video",
        "size": "normal",
        "x-match": "all"
    });

    channel.consume(queue, (msg) => {
        if (msg) {
            const file = JSON.parse(msg.content.toString());
            console.log(`Received normal video: ${file.name}`);
            channel.ack(msg);
        }
    });
}

consume().catch(console.error);