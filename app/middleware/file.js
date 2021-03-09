import {FileModel} from "@model/cms/file";
const imgReg = /<img.*?(?:>|\/>)/gi;
const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
import {config} from 'lin-mizar';
const siteDomain = process.env.NODE_ENV==='production'?config.getItem('siteDomain', 'http://localhost'):'http://127.0.0.1:2200';
const replace_path=`${siteDomain}/upload/assets/`
export async function setFileActive(content=''){
    const arr=content.match(imgReg)
    if(arr){
        for (let i = 0; i < arr.length; i++) {
            let src = arr[i].match(srcReg);
            //获取图片地址
            if(src[1]){
                const file=await FileModel.findOne({
                    where: {
                        path: src[1].replace(replace_path,'')
                    }
                })
                if(file && !file.active){
                    file.active=1
                    await file.save()
                }
            }
        }
    }else {
        const file=await FileModel.findOne({
            where: {
                path: content.replace(replace_path,'')
            }
        })
        if(file && !file.active){
            file.active=1
            await file.save()
        }
    }
}