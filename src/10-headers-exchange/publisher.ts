import * as amqp from "amqplib";

type FileMessage = {
    name: string;
    type: "pdf" | "video";
    size: number;
};

async function publish() {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    const exchange = "amq.headers";
    await channel.assertExchange(exchange, "headers");

    const files: FileMessage[] = [
        { name: "document.pdf", type: "pdf", size: 1024 },
        { name: "video.mp4", type: "video", size: 2048 },
        { name: "tutorial.mp4", type: "video", size: 4096 },
        { name: "presentation.pdf", type: "pdf", size: 512 },
        { name: "report.mov", type: "video", size: 8192 }
    ];

    for (const file of files) {
        const headers: {
            type: "pdf" | "video";
            size: "large" | "normal";
            isFile: boolean;
        } = {
            type: file.type,
            size: file.size >= 4096 ? "large" : "normal",
            isFile: true
        };

        channel.publish(exchange, "", Buffer.from(JSON.stringify(file)), {
            headers: headers
        });
        console.log(`Published: ${file.name} with headers`, headers);
    }

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

publish().catch(console.error);