/**
 * Created by vai on 4/1/17.
 */

import * as jwt from 'jsonwebtoken'
import config from '../config'


export const createToken = (data) => {
    let token = jwt.sign(data, config.Token.Secret, {
        expiresIn: config.Token.ExpiresIn
    })
    return token
}