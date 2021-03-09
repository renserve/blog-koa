import { Uploader, config } from 'lin-mizar';
import { FileModel } from '@model/cms/file';
import fs from 'fs';
import path from 'path';

class LocalUploader extends Uploader {
    /**
     * 处理文件对象
     * { size, encoding, fieldname, filename, mimeType, data }
     */
    async upload (files,modelId) {
        let arr = [],result;
        for (const file of files) {
            // 由于stream的特性，当读取其中的数据时，它的buffer会被消费
            // 所以此处深拷贝一份计算md5值
            const md5 = this.generateMd5(file);
            const siteDomain = process.env.NODE_ENV==='production'?config.getItem('siteDomain', 'http://localhost'):'http://127.0.0.1:2200';
            // 检查md5存在
            const exist = await FileModel.findOne({
                where: {
                    md5: md5
                }
            });
            if (exist) {
                result={
                    id: exist.id,
                    key: file.fieldName,
                    path: exist.path,
                    url: `${siteDomain}/upload/assets/${exist.path}`,
                    type: exist.type,
                    name: exist.name,
                    extension: exist.extension,
                    size: exist.size
                }
                arr.push(result);
            } else {
                const { absolutePath, relativePath, realName } = this.getStorePath(
                    file.filename
                );
                const target = fs.createWriteStream(absolutePath);
                await target.write(file.data);
                const ext = path.extname(realName);
                const saved = await FileModel.createRecord(
                    {
                        path: relativePath,
                        modelId:modelId || null,
                        name: realName,
                        extension: ext,
                        size: file.size,
                        md5: md5
                    },
                    true
                );
                result={
                    id: saved.id,
                    key: file.fieldName,
                    path: saved.path,
                    url: `${siteDomain}/upload/assets/${saved.path}`,
                    type: saved.type,
                    name: file.name,
                    extension: saved.extension,
                    size: saved.size
                }
                arr.push(result);
            }
        }
        return files.length>1?arr:result;
    }
}

module.exports = { LocalUploader };
