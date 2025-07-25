import * as amqp from 'amqplib';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function connect() {
	try {
		const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
		console.log('Conectado ao RabbitMQ com sucesso!');

		const channel = await connection.createChannel();
		console.log('Canal criado com sucesso!');

		await sleep(30000);

		await channel.close();
		await connection.close();
		console.log('Conexão e canal fechados com sucesso!');
	} catch (error) {
		console.error('Erro ao conectar ao RabbitMQ:', error);
		await sleep(5000);
	}
}

connect();
