import * as amqp from 'amqplib';

async function worker() {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    const queue = "work_queue";
    await channel.assertQueue(queue);

    // Process one message at a time
    channel.prefetch(1);

    console.log("Worker aguardando tarefas. Para sair pressione CTRL+C");

    channel.consume(queue, (msg) => {
        if (msg !== null) {
            const content = msg.content.toString();
            console.log(`Received: ${content}`);

            const dots = content.split(".").length - 1;
            const timeToProcess = dots * 1000;

            setTimeout(() => {
                console.log(`Done processing: ${content}`);
                channel.ack(msg);
            }, timeToProcess);
        }
    }, { noAck: false });
}

worker().catch(console.error);