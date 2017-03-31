"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const config_1 = require("../config");
let tp = nodemailer.createTransport({
    host: config_1.default.Mail.SMTP_HOST,
    port: config_1.default.Mail.SMTP_PORT,
    auth: {
        user: config_1.default.Mail.SMTP_USERNAME,
        pass: config_1.default.Mail.SMTP_PASSWORD
    },
    secure: config_1.default.Mail.SMTP_SECURE
});
exports.default = tp;
//# sourceMappingURL=mail.js.map