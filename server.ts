import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as log4js from 'log4js';
import * as jwt from 'koa-jwt';
import router from './src/routes';
import privateRouter from './src/privateRoutes';
import { createConnection } from 'typeorm';
import config from './config';
import {Token, User, UserNameChangeHistory} from './src/model';

const app = new Koa();

app.proxy = true;

const logger = log4js.getLogger();

app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = Date.now() - start.getTime();
    ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(async (ctx, next) => {
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

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, authorization',);
    if (ctx.method === 'OPTIONS') {
        ctx.status = 204;
    } else {
        await next();
    }
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(jwt({ secret: config.Token.Secret }));
app.use(privateRouter.routes());
app.use(privateRouter.allowedMethods());


createConnection({
    driver: {
        type: 'postgres',
        url: config.DATABASE
    },
    entities: [User, Token, UserNameChangeHistory],
    autoSchemaSync: true,
    logging: {
        logQueries: process.env['NODE_ENV'] === 'development',
        logFailedQueryError: process.env['NODE_ENV'] === 'development',
    }
}).then(() => {

    app.listen(3000, () => {
        console.log('Server is running at port  %s', 3000);
    });

}).catch(e => {
    console.log(e);
});
