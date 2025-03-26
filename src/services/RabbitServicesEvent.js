import amqp from 'amqplib';
import dotenv from 'dotenv';
import User from '../models/user_model.js'; 

dotenv.config();

const RABBITMQ_URL = process.env.RABBIT_HOST 
const RABBIT_EXCHANGE = "user_event";
const RABBIT_ROUTING_KEY = "user.created";
const RABBIT_EXCHANGE_CLIENT = "client_event";
const RABBIT_ROUTING_KEY_CLIENT = "client.created";
const QUEUE_NAME = "user_client_queue";

export async function userCreatedEvent(user) {
    try {
        console.log("📡 Conectando a RabbitMQ para enviar evento de usuario...");

        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBIT_HOST || 'rabbitmq',
            port: 5672,
            username: process.env.RABBIT_USER || 'admin',
            password: process.env.RABBIT_PASS || 'admin'
        });

        const channel = await connection.createChannel();
        await channel.assertExchange(RABBIT_EXCHANGE, "topic", { durable: true });

        const message = JSON.stringify(user);
        const wasSent = channel.publish(
            RABBIT_EXCHANGE,
            RABBIT_ROUTING_KEY,
            Buffer.from(message),
            { persistent: true }
        );

        if (wasSent) {
            console.log(`📤 Mensaje enviado a Exchange "${RABBIT_EXCHANGE}" con Routing Key "${RABBIT_ROUTING_KEY}":`, message);
        } else {
            console.error("❌ Error: No se pudo enviar el mensaje.");
        }

        setTimeout(async () => {
            await channel.close();
            await connection.close();
            console.log("🔌 Conexión a RabbitMQ cerrada.");
        }, 500);
        
    } catch (error) {
        console.error("❌ Error enviando mensaje a RabbitMQ:", error.message);
    }
}

async function startClientEventListener() {
    try {
        console.log("📡 Conectando a RabbitMQ para escuchar eventos de clientes...");

        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBIT_HOST || 'rabbitmq',
            port: 5672,
            username: process.env.RABBIT_USER || 'admin',
            password: process.env.RABBIT_PASS || 'admin'
        });

        const channel = await connection.createChannel();
        await channel.assertExchange(RABBIT_EXCHANGE_CLIENT, "topic", { durable: true });

        const q = await channel.assertQueue(QUEUE_NAME, { durable: true });
        await channel.bindQueue(q.queue, RABBIT_EXCHANGE_CLIENT, RABBIT_ROUTING_KEY_CLIENT);

        console.log(`🔄 Escuchando eventos de clientes en la cola: ${QUEUE_NAME}...`);

        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const clientData = JSON.parse(msg.content.toString());
                console.log("📥 Cliente recibido en user service:", clientData);

                if (clientData) {
                    const defaultPassword = '1234';

                    // ✅ Crear usuario en la base de datos
                    const newUser = await User.create({
                        id: null,
                        username: clientData.email, 
                        password: defaultPassword,
                        phone: clientData.phone,
                        status: true,
                        creationDate: new Date(),
                    });

                    console.log(`✅ Usuario creado para el cliente: ${clientData.email}`);

                    // ✅ Enviar evento a RabbitMQ para el servicio de email
                    await userCreatedEvent(newUser);
                }

                channel.ack(msg); // Confirmamos que el mensaje fue recibido
            }
        });

    } catch (error) {
        console.error("❌ Error al escuchar eventos de clientes:", error);
    }
}

// Iniciar el listener
startClientEventListener();
