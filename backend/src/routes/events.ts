// src/routes/events.ts
import { FastifyInstance } from 'fastify';

let clients: any[] = [];

export default async function eventRoutes(app: FastifyInstance) {
    app.get('/events', (req, reply) => {
        // 设置 SSE 必要的响应头
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*', // 🚨 跨域必须加
        });
        reply.raw.flushHeaders();

        // 保存客户端连接
        const client = reply.raw;
        clients.push(client);

        console.log('🔗 New SSE client connected, total:', clients.length);

        // 客户端断开时移除
        req.raw.on('close', () => {
            clients = clients.filter(c => c !== client);
            console.log('❌ Client disconnected, total:', clients.length);
        });
    });
}

// 工具函数：广播事件给所有客户端
export function broadcastEvent(data: any): void {
    const msg = `data: ${JSON.stringify(data)}\n\n`;
    console.log("📢 Broadcast to clients:", clients.length, msg);
    clients.forEach((c) => c.write(msg));
}
