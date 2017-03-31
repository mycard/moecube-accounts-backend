"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const log4js = require("log4js");
const routes_1 = require("./src/routes");
const typeorm_1 = require("typeorm");
const config_1 = require("./config");
const model_1 = require("./src/model");
typeorm_1.createConnection(process.env['DATABASE'] ||
    {
        driver: config_1.default.DATABASE,
        entities: [model_1.User, model_1.Token],
        autoSchemaSync: true
    }).then((conncection) => __awaiter(this, void 0, void 0, function* () {
    const app = new Koa();
    const logger = log4js.getLogger();
    app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
        const start = new Date();
        yield next();
        const ms = Date.now() - start.getTime();
        ctx.set('X-Response-Time', `${ms}ms`);
    }));
    app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield next();
        }
        catch (err) {
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
            }
            else if (ctx.response.status >= 400) {
                logger.warn(err);
            }
        }
    }));
    app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        ctx.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
        if (ctx.method === 'OPTIONS') {
            ctx.status = 204;
        }
        else {
            yield next();
        }
    }));
    app.use(bodyParser());
    app.use(routes_1.default.routes());
    app.use(routes_1.default.allowedMethods());
    app.listen(3000, () => { console.log('Server is running at port  %s', 3000); });
})).catch(e => {
    console.log(e);
});
//# sourceMappingURL=server.js.map