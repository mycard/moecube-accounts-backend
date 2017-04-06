import * as nodemailer from 'nodemailer';
import config from '../config';

let tp = nodemailer.createTransport({
    host: config.Mail.SMTP_HOST,
    port: config.Mail.SMTP_PORT,
    auth: {
        user: config.Mail.SMTP_USERNAME,
        pass: config.Mail.SMTP_PASSWORD
    },
    secure: config.Mail.SMTP_SECURE
});


export default tp;