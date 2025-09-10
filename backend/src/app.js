import Fastify from 'fastify'
import fastifyCors from "@fastify/cors";
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";

export function buildApp(){
    const app = fastify({logger: {
            level: 'info',
            file: './logs/server.log'
        }});

    //Basic plugin
    app.register(fastifyCors,{orign: true})
    app.register(fastifyHelmet)
    app.register(fastifyJwt,{secret: process.env.JWT_SECRET||'dev-secret'})

    //opemAPI doc
    app.register(fastifySwagger,{
        openapi:{
            info:{
                title:'PPE Watcher',
                version:'1.0.0',
            }
        }
    })
    app.register(fastifySwaggerUi,{routePrefix:'/docs', exposeRoute: true,  uiConfig: { docExpansion: 'list', deepLinking: false }})
    app.get('/health', async()=>({ok:true}));


    return app;

}