import * as amqp from 'amqplib';

async function producer() {
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    const channel = await connection.createChannel();

    const queue = 'products';
    const message = {
        id: 1,
        name: 'product a',
        price: 100
    };

    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)),
        {
            contentType: 'application/json'
        });

    console.log(`[x] Sent ${JSON.stringify(message)}`);

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

producer().catch(console.error);