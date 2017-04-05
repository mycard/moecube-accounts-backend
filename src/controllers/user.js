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
const model_1 = require("../model");
const crypto = require("crypto");
const Bluebird = require("bluebird");
const typeorm_1 = require("typeorm");
const uuid = require("uuid");
const mail_1 = require("../mail");
const config_1 = require("../../config");
exports.checkUserExists = (ctx) => __awaiter(this, void 0, void 0, function* () {
    // hack
    const u = {
        username: ctx.request.body.username || "",
        email: ctx.request.body.email || "",
        user_id: ctx.request.body.user_id || -1
    };
    const userRep = typeorm_1.getEntityManager().getRepository(model_1.User);
    let user = yield userRep
        .createQueryBuilder("user")
        .where("user.username= :username AND user.id != :user_id")
        .orWhere("user.email= :email AND user.id != :user_id")
        .setParameters({ username: u.username, email: u.email, user_id: u.user_id })
        .getOne();
    if (user) {
        ctx.body = user;
    }
    else {
        ctx.throw("i_not_found", 400);
    }
});
exports.UpdateProfiles = (ctx) => __awaiter(this, void 0, void 0, function* () {
    const u = {
        avatar: ctx.request.body.avatar,
        name: ctx.request.body.name,
        user_id: ctx.request.body.user_id
    };
    if (!u.user_id) {
        ctx.throw(400);
    }
    const userRep = typeorm_1.getEntityManager().getRepository(model_1.User);
    let user = yield userRep
        .createQueryBuilder("user")
        .where("user.id = :user_id")
        .setParameters({ user_id: u.user_id })
        .getOne();
    if (!user) {
        ctx.throw("i_user_unexists", 400);
    }
    Object.assign(user, u);
    yield typeorm_1.getEntityManager().persist(user);
    user.handleAvatar();
    ctx.body = user;
});
exports.UpdateAccount = (ctx) => __awaiter(this, void 0, void 0, function* () {
    const u = {
        email: ctx.request.body.email,
        username: ctx.request.body.username,
        new_password: ctx.request.body.new_password,
        password: ctx.request.body.password,
        user_id: ctx.request.body.user_id
    };
    if (!u.user_id || !u.password) {
        ctx.throw(400);
    }
    const userRep = typeorm_1.getEntityManager().getRepository(model_1.User);
    const tokenRep = typeorm_1.getEntityManager().getRepository(model_1.Token);
    let user = yield userRep
        .createQueryBuilder("user")
        .where("user.id = :user_id")
        .setParameters({ user_id: u.user_id })
        .getOne();
    if (!user) {
        ctx.throw("i_user_unexists", 400);
    }
    // check password
    let password_hash = (yield Bluebird.promisify(crypto.pbkdf2)(u.password, user.salt, 64000, 32, 'sha256')).toString('hex');
    if (user.password_hash != password_hash) {
        ctx.throw("i_password_error", 400);
    }
    if (u.new_password) {
        user.password_hash = (yield Bluebird.promisify(crypto.pbkdf2)(u.new_password, user.salt, 64000, 32, 'sha256')).toString('hex');
    }
    if (u.username) {
        let exists = yield userRep
            .createQueryBuilder("user")
            .where("user.username= :username AND user.id != :user_id")
            .setParameters({ username: u.username, user_id: u.user_id })
            .getOne();
        if (exists) {
            ctx.throw('i_username_exists', 400);
        }
        user.username = u.username;
    }
    if (u.email) {
        let exists = yield userRep
            .createQueryBuilder("user")
            .where("user.email= :email AND user.id != :user_id")
            .setParameters({ email: u.email, user_id: u.user_id })
            .getOne();
        if (exists) {
            ctx.throw('i_email_exists', 400);
        }
        // 未激活
        if (!user.active) {
            const key = uuid.v1();
            let token = new model_1.Token({
                key: key,
                user_id: user.id,
                data: u.email,
                type: 'activate',
            });
            yield typeorm_1.getEntityManager().persist(token);
            yield mail_1.default.sendMail({
                from: config_1.default.Mail.SMTP_USERNAME,
                to: u.email,
                subject: "验证邮箱",
                text: `单击链接 或将链接复制到网页地址栏并回车 来验证邮箱 https://accounts.moecube.com/activate?key=${key}`
            });
            user.email = u.email;
            yield userRep.persist(user);
        }
        else if (u.email != user.email) {
            // 已激活
            const key = uuid.v1();
            let token = new model_1.Token({
                key: key,
                user_id: user.id,
                data: u.email,
                type: 'activate'
            });
            yield typeorm_1.getEntityManager().persist(token);
            yield mail_1.default.sendMail({
                from: config_1.default.Mail.SMTP_USERNAME,
                to: user.email,
                subject: "修改邮箱",
                text: `单击链接 或将链接复制到网页地址栏并回车 来激活账号 https://accounts.moecube.com/activate?key=${key}`
            });
        }
    }
    ctx.body = yield userRep.persist(user);
});
//# sourceMappingURL=user.js.map