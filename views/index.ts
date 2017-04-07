/**
 * Created by zh99998 on 2017/4/7.
 */

import * as fs from 'fs';

function load_template(view: string) {
    const templates = new Map();

    // 增加语言要往这里加
    for (let locale of ['zh-CN']) {
        templates.set(locale, Handlebars.compile(fs.readFileSync(`views/${view}.${locale}.hbs`)));
    }
    return ({ locale, ...params }) => {
        return templates.get(locale)(params);
    };
}

export default {
    activate: load_template('activate'),
    reset_password: load_template('reset_password')
};
