import { Context } from 'koa';
import {Token, User, UserNameChangeHistory} from '../model';
import * as crypto from 'crypto';
import * as Bluebird from 'bluebird';
import { getEntityManager } from 'typeorm';
import tp from '../mail';
import config from '../../config';
import * as uuid from 'uuid';
import views from '../../views';
import { URL } from 'url';

var Filter = require('bad-words-chinese');
var dirtyWords = require('../dirtyWordsChinese.json');
var filter = new Filter({ chineseList: dirtyWords.words });

export const checkUserExists = async (ctx: Context) => {

    // hack
    const u = {
        username: ctx.request.body.username || '',
        email: ctx.request.body.email || '',
        user_id: ctx.request.body.user_id || -1
    };

    let isProfane = filter.isProfane(u.username)

    if(isProfane){
        ctx.body = {
            "isProfane":"true"
        };
        return;
    }

    const userRep = getEntityManager().getRepository(User);

    let user: User | undefined = await userRep
        .createQueryBuilder('user')
        .where('lower("user"."username") = lower(:username) AND user.id != :user_id')
        .orWhere('lower("user"."email") = lower(:email) AND user.id != :user_id')
        .setParameters({ username: u.username, email: u.email, user_id: u.user_id })
        .getOne();


    if (user) {
        ctx.body = user;
    } else {
        ctx.throw('i_not_found', 400);
    }
};

export const UpdateProfiles = async (ctx: Context) => {

    const { user } = ctx.state;

    if (!user.id) {
        ctx.throw(400);
    }

    if (user.username && process.env.NO_CHANGE_USERNAME) {
        ctx.throw("Changing username is currently not allowed.", 400);
    }

    const userRep = getEntityManager().getRepository(User);

    let _user: User | undefined = await userRep
        .createQueryBuilder('user')
        .where('user.id = :user_id')
        .setParameters({ user_id: user.id })
        .getOne();

    if (!_user) {
        return ctx.throw('i_user_unexists', 400);
    }


    Object.assign(_user, ctx.request.body);


    await getEntityManager().persist(_user);

    ctx.status = 200;
    ctx.body = _user;

};

export const UpdateAccount = async (ctx: Context) => {

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

    const userRep = getEntityManager().getRepository(User);
    const tokenRep = getEntityManager().getRepository(Token);

    let user: User | undefined = await userRep
        .createQueryBuilder('user')
        .where('user.id = :user_id')
        .setParameters({ user_id: u.user_id })
        .getOne();

    if (!user) {
        return ctx.throw('i_user_unexists', 400);
    }

    // check password
    let password_hash = (await Bluebird.promisify(crypto.pbkdf2)(u.password, user.salt, 64000, 32, 'sha256')).toString('hex');
    if (user.password_hash != password_hash) {
        ctx.throw('i_password_error', 400);
    }


    if (u.new_password) {
        user.password_hash = (await Bluebird.promisify(crypto.pbkdf2)(u.new_password, user.salt, 64000, 32, 'sha256')).toString('hex');
    }


    if (u.username) {

        let exists: number = await userRep
            .createQueryBuilder('user')
            .where('lower("user"."username") = lower(:username) AND user.id != :user_id')
            .setParameters({ username: u.username, user_id: u.user_id })
            .getCount();

        if (exists) {
            ctx.throw('i_username_exists', 400);
        }

        if (u.username != user.username) {
            //================
            // 关闭用户名变更
            //----------------
            ctx.status = 403;
            ctx.body = "Change username banished by administrator. Please contact mycard.";
            return;
            //================
        }

        user.username = u.username;
    }

    if (u.email) {

        let exists: number = await userRep
            .createQueryBuilder('user')
            .where('lower("user"."email") = lower(:email) AND user.id != :user_id')
            .setParameters({ email: u.email, user_id: u.user_id })
            .getCount();

        if (exists) {
            ctx.throw('i_email_exists', 400);
        }


        const key = uuid.v1();
        let token: Token = new Token({
            key: key,
            user_id: user.id!,
            data: u.email,
            type: 'activate',
        });

        await getEntityManager().persist(token);

        const url = new URL('https://accounts.moecube.com/activate');
        url.searchParams.set('key', key);
        url.searchParams.set('email', u.email);
        await tp.sendMail({
            from: config.Mail.SMTP_USERNAME,
            to: u.email,
            subject: 'MoeCube 账号邮箱验证',
            text: `单击链接 或将链接复制到网页地址栏并回车 来激活账号 ${url}`,
            html: views.activate({ locale: 'zh-CN', username: user.username, url })
        });

        // 如果用户未激活，立即变更用户的邮件地址。对于已激活的等验证邮件后再改变
        if (!user.active) {
            user.email = u.email;
        }
    }

    ctx.status = 200;
    ctx.body = await userRep.persist(user);
};


export const legacyYGOProAuth = async (ctx: Context) => {
    const userRepository = getEntityManager().getRepository(User);
    const user = await userRepository.findOne({ username: ctx.params.username });
    if (!user) {
        return ctx.throw(404);
    }
    ctx.body = { user };
};

export const legacyYGOProAvatar = async (ctx: Context) => {
    const userRepository = getEntityManager().getRepository(User);
    const user = await userRepository.findOne({ username: ctx.params.username });
    if (!user) {
        return ctx.throw(404);
    }
    ctx.redirect(user.avatarURL());
};

export const getUserAvatar = async (ctx: Context) => {
    const userRepository = getEntityManager().getRepository(User);
    const user = await userRepository.findOne({ username: ctx.params.username });
    if (!user) {
        return ctx.throw(404);
    }
    ctx.body = user.avatarURL()
};
