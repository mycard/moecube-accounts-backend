let config = process.env['NODE_ENV'] == 'development' ? require('./conf-dev').default : {
    DATABASE: process.env['DATABASE'],
    Mail: {
        SMTP_HOST: process.env['SMTP_HOST'],
        SMTP_USERNAME: process.env['SMTP_USERNAME'],
        SMTP_PASSWORD: process.env['SMTP_PASSWORD'],
        SMTP_SECURE: process.env['SMTP_SECURE'],
        SMTP_PORT: process.env['SMTP_PORT']
    },
    OSS: {
        OSS_ACCESS_ID: process.env['OSS_ACCESS_ID'],
        OSS_ACCESS_KEY: process.env['OSS_ACCESS_KEY'],
        OSS_ENDPOINT: process.env['OSS_ENDPOINT'],
        OSS_BUCKET: process.env['OSS_BUCKET']
    },
    Token: {
        Secret: process.env['TOKEN_SECRET'],
        ExpiresIn: process.env['TOKEN_EXPIRESIN']
    }
};

export default config;
