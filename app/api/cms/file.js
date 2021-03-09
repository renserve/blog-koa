import { LinRouter, ParametersException } from 'lin-mizar';

import { loginRequired } from '@middleware/jwt';
import { LocalUploader } from '@extension/file/local-uploader';
import { IsOptionalValidator} from "@validator/cms/common";

const file = new LinRouter({
    prefix: '/cms/file'
});
/**
 * @api {post} /cms/file 文件上传
 * @apiName upload
 * @apiVersion 1.0.1
 * @apiGroup 文件管理
 * @apiParam {File} file 文件(Form Data)
 * @apiParam {String} [model] 模块
 * @apiUse Authorization
 * @apiSampleRequest off
 */

file.linPost('upload', '/', loginRequired,async ctx => {
    const files = await ctx.multipart();
    if (files.length < 1) {
        throw new ParametersException({ code: 10033 });
    }
    const uploader = new LocalUploader('upload/assets');
    const arr = await uploader.upload(files,ctx.request.fields.modelId);
    ctx.json({data:arr});
});

export { file };
