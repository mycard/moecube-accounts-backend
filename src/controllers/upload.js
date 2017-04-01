"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ALY = require("aliyun-sdk");
const config_1 = require("../../config");
const busboy = require("async-busboy");
const mime = require("mime");
const uuid = require("uuid");
const ossStream = require('aliyun-oss-upload-stream')(new ALY.OSS({
    accessKeyId: config_1.default.OSS.OSS_ACCESS_ID,
    secretAccessKey: config_1.default.OSS.OSS_ACCESS_KEY,
    endpoint: config_1.default.OSS.OSS_ENDPOINT,
    apiVersion: "2013-10-15"
}));
exports.UploadImage = (ctx) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { files } = yield busboy(ctx.req);
        const res = yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
            const ext = mime.extension(file.mime);
            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].indexOf(ext) === -1) {
                throw new Error("Unsupported image type");
            }
            const filename = `avatar/${uuid.v1()}`;
            const upload = ossStream.upload({
                Bucket: config_1.default.OSS.OSS_BUCKET,
                Key: filename,
                ContentType: file.mimeType
            });
            upload.minPartSize(1048576); // 1M，表示每块part大小至少大于1M
            file.pipe(upload);
            return yield new Promise((res, rej) => {
                upload.on('error', rej);
                upload.on('uploaded', res);
            });
        })));
        ctx.body = res;
    }
    catch (err) {
        ctx.throw(403, err);
    }
});
//# sourceMappingURL=upload.js.map