import * as amqp from 'amqplib';

async function consumerWithAcks() {
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    const channel = await connection.createChannel();

    const queue = 'manual-ack-queue';

    await channel.assertQueue(queue);

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(queue, (msg) => {
        const content = msg?.content.toString();
        if (!msg || !content) {
            console.log(" [x] Received empty message");
            msg && channel.reject(msg, false);
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

consumerWithAcks().catch(console.error);