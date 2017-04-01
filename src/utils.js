/**
 * Created by vai on 4/1/17.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const config_1 = require("../config");
exports.createToken = (data) => {
    let token = jwt.sign(data, config_1.default.Token.Secret, {
        expiresIn: config_1.default.Token.ExpiresIn
    });
    return token;
};
//# sourceMappingURL=utils.js.map