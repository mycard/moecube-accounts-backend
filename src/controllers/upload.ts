import { Context } from 'koa';
import { OSS } from 'aliyun-sdk';
import config from '../../config';
import * as busboy from 'async-busboy';
import * as mime from 'mime';
import * as uuid from 'uuid';
import * as S3 from 'aws-sdk/clients/s3';

const bucket = new S3({
    apiVersion: '2006-03-01',
    endpoint: config.OSS.OSS_ENDPOINT,
    credentials: {
      accessKeyId: config.OSS.OSS_ACCESS_ID,
      secretAccessKey: config.OSS.OSS_ACCESS_KEY
    }
});


export const UploadImage = async (ctx: Context) => {
    try {
        const { files } = await busboy(ctx.req);
        ctx.body = await Promise.all(files.map(async file => {

            const ext = mime['extension'](file.mime) || "x";

            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].indexOf(ext) === -1) {
                throw new Error('Unsupported image type');
            }

            const filename = `avatars/${uuid.v1()}`;

            const result = await bucket.upload({
                Bucket: config.OSS.OSS_BUCKET,
                Key: filename,
                ContentType: file.mimeType,
                Body: file
            }).promise();
            return result;
        }));
    } catch (err) {
        ctx.throw(403, err);
    }
};