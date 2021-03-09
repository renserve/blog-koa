import {setFileActive} from "@middleware/file";

const { NotFound ,RepeatException} = require("lin-mizar");
const { Blacklist } = require("@model/cms/blacklist");
import { set} from "lodash";
class BlacklistDao {
    // 创建黑名单
    async createToBlacklist(v,ctx,remark) {
        const isBlack = await Blacklist.findOne({
            where: {
                modelId:v.get("body.modelId"),
                email: v.get("body.email")
            }
        });
        if(v.get("body.avatar")){
            await setFileActive(v.get("body.avatar"))
        }
        if(isBlack){
            throw new RepeatException({
                message: "此IP或此邮箱已被拉黑"
            });
        }
        await Blacklist.create({
            nickname: v.get("body.nickname"),
            operateId: ctx.currentUser.id,
            modelId:v.get("body.modelId"),
            classId:v.get("body.classId"),
            ip: v.get("body.ip"),
            area: v.get("body.area"),
            email: v.get("body.email"),
            avatar: v.get("body.avatar"),
            remark: remark
        })
    }
    async createBlacklist(v,ctx) {
        const isBlack = await Blacklist.findOne({
            where: {
                modelId:v.get("body.modelId"),
                email: v.get("body.email")
            }
        });
        if(isBlack){
            throw new RepeatException({
                message: "此IP或此邮箱已被拉黑"
            });
        }
        if(v.get("body.avatar")){
            await setFileActive(v.get("body.avatar"))
        }
        await Blacklist.create({
            nickname: v.get("body.nickname"),
            operateId: ctx.currentUser.id,
            modelId:v.get("body.modelId"),
            email: v.get("body.email"),
            avatar: v.get("body.avatar"),
            remark: v.get("body.remark")
        })
    }

    // 获取黑名单
    async getBlacklists(v,ctx) {
        const condition={modelId:v.get("query.modelId")}
        if(!ctx.currentUser){
            return (await Blacklist.findAll({
                where:condition
            }));

        }
        const page = v.get('query.page');
        const count1 = v.get('query.count');
        const email=v.get("query.email")
        email && set(condition, 'email',email);
        const { rows, count } = await Blacklist.findAndCountAll({
            where: Object.assign({}, condition),
            offset: page * count1,
            limit: count1,
            order: [
                ["createdAt", "DESC"]
            ]
        });
        return {
            rows,
            total: count
        };
    }
    
    // 删除黑名单
    async deleteBlacklist(id) {
        const blacklist = await Blacklist.findOne({
            where: {
                id
            }
        });
        if (!blacklist) {
            throw new NotFound({
                message: "没有找到相关黑名单"
            });
        }
        blacklist.destroy();
    }
}

export {
    BlacklistDao
};
