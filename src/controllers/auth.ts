import { Context } from 'koa';
import { SignIn, SignUp, Token, User } from '../model';
import * as crypto from 'crypto';
import { getEntityManager } from 'typeorm';
import * as Bluebird from 'bluebird';
import tp from '../mail';
import * as uuid from 'uuid';
import config from '../../config';
import { createToken } from '../utils';


export const signin = async (ctx: Context) => {

    let u: SignIn = {
        account: ctx.request.body.account,
        password: ctx.request.body.password
    };

    const userRep = getEntityManager().getRepository(User);

    let user: User | undefined = await userRep
        .createQueryBuilder('user')
        .where('user.username= :account OR user.email= :account')
        .setParameters({ account: u.account })
        .getOne();

    if (!user) {
        return ctx.throw('i_user_unexists', 400);
    }

    let password_hash = (await Bluebird.promisify(crypto.pbkdf2)(u.password, user.salt, 64000, 32, 'sha256')).toString('hex');

    if (user.password_hash != password_hash) {
        ctx.throw('i_password_error', 400);
    }

    const token = createToken({
        id: user.id
    });

    user.handleAvatar!();

    ctx.body = {
        user,
        token
    };

};

export const signup = async (ctx: Context) => {

    let u: SignUp = {
        username: ctx.request.body.username,
        name: ctx.request.body.name,
        email: ctx.request.body.email,
        password: ctx.request.body.password,
    };


    if (!u.password || !u.email || !u.username) {
        ctx.throw(400);
    }


    const userRep = getEntityManager().getRepository(User);

    // check user exists
    let exists: User | undefined = await userRep
        .createQueryBuilder('user')
        .where('user.username= :username OR user.email= :email')
        .setParameters({ username: u.username, email: u.email })
        .getOne();

    if (exists) {
        if (exists.email == u.email) {
            ctx.throw('i_email_exists', 400);
        } else if (exists.username == u.username) {
            ctx.throw('i_username_exists', 400);
        }
        return;
    }

    let salt = crypto.randomBytes(8).toString('hex');

    let password_hash = (await Bluebird.promisify(crypto.pbkdf2)(u.password, salt, 64000, 32, 'sha256')).toString('hex');

    let newUser = new User({
        name: u.name,
        username: u.username,
        email: u.email,
        password_hash,
        salt,
        admin: false,
        active: false,
        avatar: '',
        locale: 'zh-CN',
        registration_ip_address: ctx.request.ip,
        ip_address: ctx.request.ip,
        created_at: new Date(),
        updated_at: new Date()
    });

    newUser.handleAvatar!();


    const user = await getEntityManager().persist(newUser);

    const key = uuid.v1();
    let _token: Token = new Token({
        key: key,
        user_id: user.id!,
        data: user.email,
        type: 'activate'
    });

    await getEntityManager().persist(_token);
    await tp.sendMail({
        from: config.Mail.SMTP_USERNAME,
        to: user.email,
        subject: '感谢乃注册MoeCube账号',
        text: `单击链接 或将链接复制到网页地址栏并回车 来激活账号 https://accounts.moecube.com/activate?key=${key}`
    });

    const token = createToken({
        id: user.id
    });

    ctx.body = {
        user,
        token
    };
};

export const forgot = async (ctx: Context) => {

    let u = {
        account: ctx.request.body.account
    };
    if (!u.account) {
        ctx.throw(400);
    }

    const userRep = getEntityManager().getRepository(User);

    let user: User | undefined = await userRep
        .createQueryBuilder('user')
        .where('user.username= :account OR user.email= :account')
        .setParameters({ account: u.account })
        .getOne();

    if (!user) {
        return ctx.throw('i_user_unexists', 400);
    }

    const key = uuid.v1();
    let token: Token = new Token({
        key: key,
        user_id: user.id!,
        data: user.email,
        type: 'activate'
    });


    await getEntityManager().persist(token);

    ctx.body = await tp.sendMail({
        from: config.Mail.SMTP_USERNAME,
        to: user.email,
        subject: '修改密码',
        text: `单击链接 或将链接复制到网页地址栏并回车 来修改密码 http://accounts.moecube.com/reset?key=${key}&user_id=${user.id}`
    });
};

export const resetPassword = async (ctx: Context) => {

    let u = {
        user_id: ctx.request.body.user_id,
        key: ctx.request.body.key,
        password: ctx.request.body.password
    };
    if (!u.user_id || !u.key || !u.password) {
        ctx.throw(400);
    }

    const tokenReq = getEntityManager().getRepository(Token);
    let token: Token = (await tokenReq.findOne({ key: u.key, user_id: u.user_id }))!;


    if (!token) {
        ctx.throw('i_key_time_out', 400);
    }

    const userRep = getEntityManager().getRepository(User);
    let user: User | undefined = await userRep.findOneById(u.user_id);

    if (!user) {
        ctx.throw('i_user_unexists', 400);
        return;
    }

    let salt = crypto.randomBytes(8).toString('hex');

    let password_hash = (await Bluebird.promisify(crypto.pbkdf2)(u.password, salt, 64000, 32, 'sha256')).toString('hex');


    user.password_hash = password_hash;

    ctx.body = await getEntityManager().persist(user);

    await tokenReq.remove(token);

};

export const activate = async (ctx: Context) => {

    let u = {
        key: ctx.request.body.key
    };

    if (!u.key) {
        ctx.throw(400);
    }
    const tokenReq = getEntityManager().getRepository(Token);
    const userReq = getEntityManager().getRepository(User);

    let token: Token | undefined = await tokenReq.findOne({ key: u.key });

    if (!token) {
        ctx.throw('i_key_invalid', 400);
        return;
    }

    let user: User = (await userReq.findOne({ id: token.user_id }))!;
    user.active = true;
    user.email = token.data;

    ctx.body = await userReq.persist(user);

    let tokens: Token[] = await tokenReq.find({ user_id: user.id, type: 'activate' });

    await tokenReq.remove(tokens);

};


export const authUser = async (ctx: Context) => {
    const { user } = ctx.state;
    const userReq = getEntityManager().getRepository(User);

    let u: User = (await userReq.findOne({ id: user.id }))!;
    u.handleAvatar!();

    ctx.body = u;
};