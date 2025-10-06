// src/routes/events.ts
import { FastifyInstance } from 'fastify';

let clients: any[] = [];

export default async function eventRoutes(app: FastifyInstance) {
    app.get('/events', (req, reply) => {
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*', //
        });
        reply.raw.flushHeaders();

        const client = reply.raw;
        clients.push(client);

        console.log('🔗 New SSE client connected, total:', clients.length);

        req.raw.on('close', () => {
            clients = clients.filter(c => c !== client);
            console.log('❌ Client disconnected, total:', clients.length);
        });
    });
}

export function broadcastEvent(data: any): void {
    const msg = `data: ${JSON.stringify(data)}\n\n`;
    console.log("📢 Broadcast to clients:", clients.length, msg);
    clients.forEach((c) => c.write(msg));
}
