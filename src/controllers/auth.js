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
const typeorm_1 = require("typeorm");
const Bluebird = require("bluebird");
const mail_1 = require("../mail");
const uuid = require("uuid");
const config_1 = require("../../config");
const utils_1 = require("../utils");
exports.signin = (ctx) => __awaiter(this, void 0, void 0, function* () {
    let u = {
        account: ctx.request.body.account,
        password: ctx.request.body.password
    };
    const userRep = typeorm_1.getEntityManager().getRepository(model_1.User);
    let user = yield userRep
        .createQueryBuilder("user")
        .where("user.username= :account OR user.email= :account")
        .setParameters({ account: u.account })
        .getOne();
    if (!user) {
        ctx.throw("i_user_unexists", 400);
    }
    let password_hash = (yield Bluebird.promisify(crypto.pbkdf2)(u.password, user.salt, 64000, 32, 'sha256')).toString('hex');
    if (user.password_hash != password_hash) {
        ctx.throw("i_password_error", 400);
    }
    const token = utils_1.createToken({
        id: user.id
    });
    user.handleAvatar();
    ctx.body = {
        user,
        token
    };
});
exports.signup = (ctx) => __awaiter(this, void 0, void 0, function* () {
    let u = {
        username: ctx.request.body.username,
        name: ctx.request.body.name,
        email: ctx.request.body.email,
        password: ctx.request.body.password,
    };
    if (!u.password || !u.email || !u.username) {
        ctx.throw(400);
    }
    const userRep = typeorm_1.getEntityManager().getRepository(model_1.User);
    // check user exists
    let exists = yield userRep
        .createQueryBuilder("user")
        .where("user.username= :username OR user.email= :email")
        .setParameters({ username: u.username, email: u.email })
        .getOne();
    if (exists) {
        if (exists.email == u.email) {
            ctx.throw("i_email_exists", 400);
        }
        else if (exists.username == u.username) {
            ctx.throw("i_username_exists", 400);
        }
    }
    let salt = crypto.randomBytes(8).toString("hex");
    let password_hash = (yield Bluebird.promisify(crypto.pbkdf2)(u.password, salt, 64000, 32, 'sha256')).toString('hex');
    let newUser = new model_1.User({
        name: u.name,
        username: u.username,
        email: u.email,
        password_hash,
        salt,
        admin: false,
        active: false,
        avatar: "",
        locale: 'zh-CN',
        registration_ip_address: ctx.request.ip,
        ip_address: ctx.request.ip,
        created_at: new Date(),
        updated_at: new Date()
    });
    const user = yield typeorm_1.getEntityManager().persist(newUser);
    const key = uuid.v1();
    let _token = new model_1.Token({
        key: key,
        user_id: user.id,
        data: user.email,
        type: 'activate'
    });
    yield typeorm_1.getEntityManager().persist(_token);
    yield mail_1.default.sendMail({
        from: config_1.default.Mail.SMTP_USERNAME,
        to: user.email,
        subject: "感谢乃注册MoeCube账号",
        text: `单击链接 或将链接复制到网页地址栏并回车 来激活账号 https://accounts.moecube.com/activate?key=${key}`
    });
    const token = utils_1.createToken({
        id: user.id
    });
    ctx.body = {
        user,
        token
    };
});
exports.forgot = (ctx) => __awaiter(this, void 0, void 0, function* () {
    let u = {
        account: ctx.request.body.account
    };
    if (!u.account) {
        ctx.throw(400);
    }
    const userRep = typeorm_1.getEntityManager().getRepository(model_1.User);
    let user = yield userRep
        .createQueryBuilder("user")
        .where("user.username= :account OR user.email= :account")
        .setParameters({ account: u.account })
        .getOne();
    if (!user) {
        ctx.throw("i_user_unexists", 400);
    }
    const key = uuid.v1();
    let token = new model_1.Token({
        key: key,
        user_id: user.id,
        data: user.email,
        type: 'activate'
    });
    yield typeorm_1.getEntityManager().persist(token);
    ctx.body = yield mail_1.default.sendMail({
        from: config_1.default.Mail.SMTP_USERNAME,
        to: user.email,
        subject: "修改密码",
        text: `单击链接 或将链接复制到网页地址栏并回车 来修改密码 http://accounts.moecube.com/reset?key=${key}&user_id=${user.id}`
    });
});
exports.resetPassword = (ctx) => __awaiter(this, void 0, void 0, function* () {
    let u = {
        user_id: ctx.request.body.user_id,
        key: ctx.request.body.key,
        password: ctx.request.body.password
    };
    if (!u.user_id || !u.key || !u.password) {
        ctx.throw(400);
    }
    const tokenReq = typeorm_1.getEntityManager().getRepository(model_1.Token);
    let token = yield tokenReq.findOne({ key: u.key, user_id: u.user_id });
    if (!token) {
        ctx.throw("i_key_time_out", 400);
    }
    const userRep = typeorm_1.getEntityManager().getRepository(model_1.User);
    let user = yield userRep.findOneById(u.user_id);
    if (!user) {
        ctx.throw("i_user_unexists", 400);
    }
    let salt = crypto.randomBytes(8).toString("hex");
    let password_hash = (yield Bluebird.promisify(crypto.pbkdf2)(u.password, salt, 64000, 32, 'sha256')).toString('hex');
    user.password_hash = password_hash;
    ctx.body = yield typeorm_1.getEntityManager().persist(user);
    yield tokenReq.remove(token);
});
exports.activate = (ctx) => __awaiter(this, void 0, void 0, function* () {
    let u = {
        key: ctx.request.body.key
    };
    if (!u.key) {
        ctx.throw(400);
    }
    const tokenReq = typeorm_1.getEntityManager().getRepository(model_1.Token);
    const userReq = typeorm_1.getEntityManager().getRepository(model_1.User);
    let token = yield tokenReq.findOne({ key: u.key });
    if (!token) {
        ctx.throw("i_key_invalid", 400);
    }
    let user = yield userReq.findOne({ id: token.user_id });
    user.active = true;
    user.email = token.data;
    ctx.body = yield userReq.persist(user);
    let tokens = yield tokenReq.find({ user_id: user.id, type: 'activate' });
    yield tokenReq.remove(tokens);
});
exports.authUser = (ctx) => __awaiter(this, void 0, void 0, function* () {
    const { user } = ctx.state;
    const userReq = typeorm_1.getEntityManager().getRepository(model_1.User);
    let u = yield userReq.findOne({ id: user.id });
    u.handleAvatar();
    ctx.body = u;
});
//# sourceMappingURL=auth.js.map