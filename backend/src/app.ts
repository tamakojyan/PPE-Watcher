// src/app.ts
import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import users from "./routes/user";
import contacts from "./routes/contact";
import violations from "./routes/violation";
import notifications from "./routes/notification";
import auth from "./routes/auth";
import bookmark from "./routes/bookmark";
import configRoutes from "@routes/config";
import eventRoutes from './routes/events';

export function buildApp(): FastifyInstance {
    const app = fastify({
        logger: {
            level: 'info',
            // Enable pretty logging in development
            transport: {
                target: 'pino-pretty',
                options: { colorize: true }
            }        }
    });

    // Register CORS plugin
    app.register(cors, {
        origin: true,                           // Allow all origins (adjust as needed)
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    });

    // Register security headers plugin
    app.register(helmet);

    // Register JWT plugin for authentication
    app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret' });
    app.decorate(
        'authenticate',
        async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
            try {
                await req.jwtVerify();
            } catch {
                reply.code(401).send({ message: 'Unauthorized' });
            }
        }
    );
    // Register Swagger (OpenAPI) plugin
    app.register(swagger, {
        openapi: { info: { title: 'PPE Watcher', version: '1.0.0' } }
    });
    app.register(swaggerUi, { routePrefix: '/docs' });



    app.register(auth);
    app.register(users);
    app.register(contacts);
    app.register(violations);
    app.register(notifications);
    app.register(bookmark);
    app.register(configRoutes)
    app.register(eventRoutes);

    return app;
}
