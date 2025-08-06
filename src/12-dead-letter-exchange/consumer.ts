import * as amqp from 'amqplib';

async function deadLetterExchange() {
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    const channel = await connection.createChannel();

    const queue = 'nfe.queue';
    const deadLetterQueue = "dlx.queue";

    await channel.assertExchange("amq.direct", "direct");
    await channel.assertQueue(queue, {
        deadLetterExchange: "dlx.exchange"
    });

    await channel.bindQueue(queue, "amq.direct", "order");


    await channel.assertExchange("dlx.exchange", "direct");
    await channel.assertQueue(deadLetterQueue)
    await channel.bindQueue(deadLetterQueue, "dlx.exchange", "order");

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(queue, (msg) => {
        const content = msg?.content.toString();
        if (!msg || !content) {
            console.log(" [x] Received empty message");
            msg && channel.reject(msg, false); // dispara o dead letter
            return;
        }

        console.log(" [x] Received %s", content);

        try {
            if (parseInt(content) > 5) {
                throw new Error("Processing failed");
            }

            console.log("[x] Done processing...")
            channel.ack(msg, true);
        } catch (error) {
            console.error("[!] Processing error:", error.message);

            channel.nack(msg, false, true); // channel.reject(msg, true)
        }
    }, { noAck: false });
}

deadLetterExchange().catch(console.error);