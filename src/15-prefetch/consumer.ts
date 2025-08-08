import * as amqp from 'amqplib';

async function consumer() {
    const connection = await amqp.connect("amqp://admin:admin@rabbitmq:5672");
    const channel = await connection.createChannel();

    const queue = "queue1.test";
    await channel.assertQueue(queue);

    console.log("Consumer aguardando tarefas. Pressione CTRL+C para sair.");

    // prefetch por canal
    channel.prefetch(1000, true);

    // prefetch por consumidor
    channel.prefetch(1000);

    channel.consume(queue,
        (msg) => {
            // sem ack para ver o comportamento do prefetch

            // manual ack - rede
            // channel.ack(msg, true);
        },
        { noAck: false }
    );

    channel.consume("queue2.test",
        (msg) => {
            // sem ack para ver o comportamento do prefetch
        },
        { noAck: false }
    );
}

consumer()
    .then(() => console.log("Consumer started"))
    .catch(console.error);