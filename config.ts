let config = process.env["NODE_ENV"] == 'development' ? require('./conf-dev').default : {
        DATABASE: {
            type: process.env["DATABASE_TYPE"],
            host: process.env["DATABASE_HOST"],
            port: process.env["DATABASE_PORT"],
            username: process.env["DATABASE_USERNAME"],
            password: process.env["DATABASE_PASSWORD"],
            database: process.env["DABABASE"]
        },
        Mail: {
            SMTP_HOST: process.env["MIAl_SMTP_HOST"],
            SMTP_USERNAME: process.env["MAIL_SMTP_USERNAME"],
            SMTP_PASSWORD: process.env["MAIL_SMTP_PASSWORD"],
            SMTP_SECURE: process.env["MAIL_SMTP_SECURE"],
            SMTP_PORT: process.env["MAIL_SMTP_PORT"]
        },
        OSS: {
            OSS_ACCESS_ID: process.env["OSS_ACCESS_ID"],
            OSS_ACCESS_KEY: process.env["OSS_ACCESSS_KEY"],
            OSS_ENDPOINT: process.env["OSS_ENDPOINT"],
            OSS_BUCKET: process.env["OSS_BUCKET"]
        },
        Token: {
            Secret: process.env["TOKEN_SECRET"],
            ExpiresIn: process.env["TOKEN_EXPIRESIN"]
        }
    };

export default config;