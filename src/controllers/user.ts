import {Context} from 'koa'
import {User, Token} from "../model";
import * as crypto from 'crypto'
import * as Bluebird from 'bluebird'
import {getEntityManager} from "typeorm";
import uuid = require("uuid");
import tp from "../mail";
import config from '../../config'


export const checkUserExists= async (ctx: Context) => {

    // hack
    const u = {
        username: ctx.request.body.username || "",
        email: ctx.request.body.email || "",
        user_id: ctx.request.body.user_id || -1
    }


    const userRep = getEntityManager().getRepository(User);

    let user :User = await userRep
        .createQueryBuilder("user")
        .where("user.username= :username AND user.id != :user_id")
        .orWhere("user.email= :email AND user.id != :user_id")
        .setParameters({username: u.username, email: u.email, user_id: u.user_id})
        .getOne()

    if(user) {
        ctx.body = user
    } else {
        ctx.throw("not found", 400)
    }

}

export const UpdateProfiles = async(ctx: Context) => {

    const u = {
        name: ctx.request.body.name,
        user_id: ctx.request.body.user_id
    }

    if(!u.user_id){
        ctx.throw(400)
    }

    const userRep = getEntityManager().getRepository(User);

    let user: User = await userRep
        .createQueryBuilder("user")
        .where("user.id = :user_id")
        .setParameters({user_id: u.user_id})
        .getOne();

    if (!user) {
        ctx.throw("user not exists", 400)
    }


    Object.assign(user, u)

    ctx.body = await getEntityManager().persist(user)

}

export const UpdateAccount = async (ctx: Context) => {

    const u = {
        email: ctx.request.body.email,
        username: ctx.request.body.username,
        new_password: ctx.request.body.new_password,
        password: ctx.request.body.password,
        user_id: ctx.request.body.user_id
    }

    if(!u.user_id || !u.password){
        ctx.throw(400)
    }

    const userRep = getEntityManager().getRepository(User);

    let user: User = await userRep
        .createQueryBuilder("user")
        .where("user.id = :user_id")
        .setParameters({user_id: u.user_id})
        .getOne();

    if (!user) {
        ctx.throw("user not exists", 400)
    }

    // check password
    let password_hash = (await Bluebird.promisify(crypto.pbkdf2)(u.password, user.salt, 64000, 32, 'sha256')).toString('hex');
    if(user.password_hash != password_hash) {
        ctx.throw("password is not correct", 400)
    }


    if(u.new_password){
        user.password_hash = (await Bluebird.promisify(crypto.pbkdf2)(u.new_password, user.salt, 64000, 32, 'sha256')).toString('hex');
    }


    if(u.username) {

        let exists: User = await userRep
            .createQueryBuilder("user")
            .where("user.username= :username AND user.id != :user_id")
            .setParameters({username: u.username, user_id: u.user_id})
            .getOne()

        if (exists) {
            ctx.throw('username exists', 400)
        }

        user.username = u.username
    }

    if(u.email) {

        let exists: User = await userRep
            .createQueryBuilder("user")
            .where("user.email= :email AND user.id != :user_id")
            .setParameters({email: u.email, user_id: u.user_id})
            .getOne()

        if (exists) {
            ctx.throw('email exists', 400)
        }

        // 未激活
        if(!user.active){

            const key = uuid.v1();
            let token :Token = new Token();
            Object.assign(token, {
                key: key,
                user_id: user.id,
                data: user.email,
                type: 'activate'
            });

            await getEntityManager().persist(token);
            await tp.sendMail({
                from: config.Mail.SMTP_USERNAME,
                to: user.email,
                subject: "修改邮箱",
                text: `单击链接 或将链接复制到网页地址栏并回车 来修改邮箱 https://accounts.moecube.com/activate.html?${key}`
            });

            user.email = u.email
            await getEntityManager().persist(user)

        } else if(u.email != user.email) {
            // 已激活
            const key = uuid.v1();
            let token :Token = new Token();
            Object.assign(token, {
                key: key,
                user_id: user.id,
                data: user.email,
                type: 'changeEmail'
            });

            await getEntityManager().persist(token);
            await tp.sendMail({
                from: config.Mail.SMTP_USERNAME,
                to: user.email,
                subject: "修改邮箱",
                text: `单击链接 或将链接复制到网页地址栏并回车 来激活账号 https://accounts.moecube.com/activate.html?${key}`
            });
        }
    }

    ctx.body = await getEntityManager().persist(user)

}