"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
// src/app.ts
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const user_1 = __importDefault(require("./routes/user"));
const contact_1 = __importDefault(require("./routes/contact"));
const violation_1 = __importDefault(require("./routes/violation"));
const notification_1 = __importDefault(require("./routes/notification"));
const auth_1 = __importDefault(require("./routes/auth"));
const bookmark_1 = __importDefault(require("./routes/bookmark"));
const config_1 = __importDefault(require("@routes/config"));
const events_1 = __importDefault(require("./routes/events"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
function buildApp() {
    const app = (0, fastify_1.default)({
        logger: {
            level: 'info',
            // Enable pretty logging in development
            transport: {
                target: 'pino-pretty',
                options: { colorize: true }
            }
        }
    });
    // Register CORS plugin
    app.register(cors_1.default, {
        origin: true, // Allow all origins (adjust as needed)
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    });
    // Register security headers plugin
    app.register(helmet_1.default);
    // Register JWT plugin for authentication
    app.register(jwt_1.default, { secret: process.env.JWT_SECRET || 'dev-secret' });
    app.decorate('authenticate', async (req, reply) => {
        try {
            await req.jwtVerify();
        }
        catch {
            reply.code(401).send({ message: 'Unauthorized' });
        }
    });
    // Register Swagger (OpenAPI) plugin
    app.register(swagger_1.default, {
        openapi: { info: { title: 'PPE Watcher', version: '1.0.0' } }
    });
    app.register(swagger_ui_1.default, { routePrefix: '/docs' });
    app.register(multipart_1.default, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
        },
    });
    app.register(auth_1.default);
    app.register(user_1.default);
    app.register(contact_1.default);
    app.register(violation_1.default);
    app.register(notification_1.default);
    app.register(bookmark_1.default);
    app.register(config_1.default);
    app.register(events_1.default);
    app.register(static_1.default, {
        root: path_1.default.join(process.cwd(), 'uploads'),
        prefix: '/uploads/',
        setHeaders: (res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // 
        },
    });
    return app;
}
