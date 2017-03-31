import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as log4js from 'log4js';
import router from './src/routes';
import { createConnection } from 'typeorm'
import config from './config'
import {User, Token} from "./src/model";


createConnection(process.env['DATABASE'] ||
    {
        driver: config.DATABASE,
        entities: [ User, Token ],
        autoSchemaSync: true
    }).then( async conncection => {

    const app = new Koa();

    const logger = log4js.getLogger();

    app.use(async(ctx, next) => {
        const start = new Date();
        await next();
        const ms = Date.now() - start.getTime();
        ctx.set('X-Response-Time', `${ms}ms`);
    });

    app.use(async(ctx, next) => {
        try {
            await next();
        } catch (err) {
            // will only respond with JSON
            console.log(err);
            ctx.status = err.status || 500;
            ctx.body = {
                message: err.message,
            };
            if (err.errCode) {
                ctx.body['errCode'] = err.errCode;
            }
            if (ctx.response.status >= 500) {
                logger.error(err);
            } else if (ctx.response.status >= 400) {
                logger.warn(err);
            }
        }
    });

    app.use(async(ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        ctx.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With',);
        if (ctx.method === 'OPTIONS') {
            ctx.status = 204;
        } else {
            await next();
        }
    });

    app.use(bodyParser());
    app.use(router.routes());
    app.use(router.allowedMethods());

    app.listen(3000, () => { console.log('Server is running at port  %s', 3000); });

}).catch(e => {
    console.log(e)
})



