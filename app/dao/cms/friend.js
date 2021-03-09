const { NotFound, Forbidden } = require("lin-mizar");
const { Friend ,requireModel} = require("@model/cms/friend");
import { Sequelize,Op } from 'sequelize';
import {setFileActive} from "@middleware/file";
import { set } from "lodash";
class FriendDao {
    // 创建友链
    async createFriend(v,ctx) {
        const friend = await Friend.findOne({
            where: {
                name: v.get("body.name"),
                modelId: v.get("body.modelId"),
            }
        });
        if (friend) {
            throw new Forbidden({
                message: "已经存在该友链名"
            });
        }
        if(v.get("body.avatar")){
            await setFileActive(v.get("body.avatar"))
        }
        await Friend.create({
            name: v.get("body.name"),
            operateId: ctx.currentUser.id,
            modelId: v.get("body.modelId"),
            link: v.get("body.link"),
            avatar: v.get("body.avatar") || null
        });
    }
    
    // 修改友链
    async updateFriend(v,ctx) {
        const operateId = ctx.currentUser.id;
        const id=v.get(`body.id`)
        const avatar=v.get(`body.avatar`)
        const friend = await Friend.findByPk(id);
        if (!friend) {
            throw new NotFound({
                message: "没有找到相关友链"
            });
        }
        let isChange;
        Object.keys(requireModel).concat(['avatar']).map(k=>{
            if(friend[k] !== v.get(`body[${k}]`)){
                friend[k] = v.get(`body[${k}]`)
                isChange=true
            }
        })
        if(operateId!==friend.operateId){
            isChange=true
            friend.operateId=operateId
        }
        if(avatar && avatar!==friend.avatar){
            await setFileActive(v.get("body.avatar"))
        }
        isChange && await friend.save();
    }
    
    // 获取友链
    async getFriends(v,ctx) {
        const modelId=v.get("query.modelId")
        const name=v.get("query.name")
        const condition={
            where: {modelId},
        }
        if(!ctx.currentUser){
            return (await Friend.findAll(condition))
        }

        const page = v.get('query.page');
        const count1 = v.get('query.count');
        name && set(condition, 'where.name',{
            [Op.like]:`%${name}%`
        });
        const { rows, count } = await Friend.findAndCountAll({
            ...condition,
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
    
    // 删除友链
    async deleteFriend(id) {
        const friend = await Friend.findOne({
            where: {
                id
            }
        });
        if (!friend) {
            throw new NotFound({
                message: "没有找到相关友链"
            });
        }
        friend.destroy();
    }
}

export {
    FriendDao
};
