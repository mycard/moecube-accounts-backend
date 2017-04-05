import {Context} from 'koa'
import * as ALY from 'aliyun-sdk'
import config from '../../config'
import * as busboy from 'async-busboy'
import * as  mime from 'mime'
import * as uuid from 'uuid'

const ossStream = require('aliyun-oss-upload-stream')(new ALY.OSS({
    accessKeyId: config.OSS.OSS_ACCESS_ID,
    secretAccessKey: config.OSS.OSS_ACCESS_KEY,
    endpoint: config.OSS.OSS_ENDPOINT,
    apiVersion: "2013-10-15"
}));



export const UploadImage = async (ctx: Context) => {

    try {
        const { files } = await busboy(ctx.req)
        const res = await Promise.all(files.map(async file => {

            const ext = mime.extension(file.mime)
            if(['png','jpg','jpeg','gif','webp'].indexOf(ext) === -1) {
                throw new Error("Unsupported image type")
            }

            const filename = `avatar/${uuid.v1()}`

            const upload = ossStream.upload({
                Bucket: config.OSS.OSS_BUCKET,
                Key: filename,
                ContentType: file.mimeType
            })

            upload.minPartSize(1048576); // 1M，表示每块part大小至少大于1M

            file.pipe(upload)

            return await new Promise((res, rej) => {
                upload.on('error', rej)
                upload.on('uploaded', res)
            })
        }))
        ctx.body = res
    } catch (err) {
        ctx.throw(403, err)
    }
}


