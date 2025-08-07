import * as amqp from 'amqplib';

async function deadLetterExchange() {
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    const channel = await connection.createChannel();

    const queue = 'nfe.queue';
    const retryQueue = "retry.queue";
    const failQueue = "fail.queue";

    await channel.assertExchange("amq.direct", "direct");
    await channel.assertQueue(queue);

    await channel.bindQueue(queue, "amq.direct", "order");
    await channel.assertQueue(failQueue);

    await channel.assertExchange("dlx.exchange", "direct");
    await channel.assertQueue(retryQueue);
    await channel.bindQueue(retryQueue, "dlx.exchange", "order");

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(queue, (msg) => {
        const content = msg?.content.toString();
        if (!msg || !content) {
            console.log(" [x] Received empty message");
            if (msg) {
                const newMsg = {
                    error: "Empty message received",
                    payload: ""
                };
                channel.sendToQueue(failQueue, Buffer.from(JSON.stringify(newMsg)));

                channel.ack(msg);
            }
            return;
        }

        console.log(" [x] Received %s", content);

        try {
            if (parseInt(content) > 5) {
                throw new Error("Processing failed");
            }

            console.log("[x] Done processing...")
            channel.ack(msg);
        } catch (error) {
            //se aconteceu um erro não reprocessável, publicar na fila de falha
            const maxRetries = 3;
            const xDeath = msg.properties.headers?.["x-death"] || [];
            const retryCount = xDeath[0]?.count || 0;

            if (retryCount < maxRetries) {
                channel.nack(msg, false, false); //channel.reject(msg, false);

                console.log(`[!] Retrying message, retry count: ${retryCount}`);
            } else {
                const newMsg = { error: error.message, payload: content };

                channel.sendToQueue('fail.queue', Buffer.from(JSON.stringify(newMsg)));

                console.log(`[!] Sending message to fail queue`);

                channel.ack(msg);
            }

            console.error("[!] Processing error:", error.message);
        }
    }, { noAck: false });
}

deadLetterExchange().catch(console.error);