import * as amqp from 'amqplib';

async function consumer() {
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    const channel = await connection.createChannel();

    const queue = 'products'; // ou hello

    await channel.assertQueue(queue);
    console.log(`[x] Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(queue, (msg) => {
        if (msg) {
            console.log(`[x] Received ${msg.content.toString()}`);
            console.log(`${msg.properties.contentType} is the content type`);
        }
    }, { noAck: true });
}

consumer().catch(console.error);