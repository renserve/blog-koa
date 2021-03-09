const { NotFound, Forbidden } = require("lin-mizar");
const { Message } = require("@model/cms/message");
import { Sequelize,Op } from 'sequelize';
const { Article } = require("@model/article/article");
import { set, get,zipObject } from "lodash";
import xss from 'xss'
import {getUserArea, getUserIp, limitCount} from '@middleware/jwt-config'
class MessageDao {
    async createMessage(v,ctx) {
        const messages=await Message.findAll({
            where:{
                email:v.get(`body.email`)
            }
        })
        const userLevel=0
        if(!ctx.currentUser){
            if(messages && messages.length>limitCount.message.count[userLevel]){
                throw new Forbidden({
                    message: `留言超过限制(${limitCount.message.count[userLevel]}条/人)`
                });
            }
        }
        let ip=null,area=null;
        if(!ctx.currentUser){
            ip=getUserIp(ctx)
            area=await getUserArea(ip)
        }
        const xssFilter=['nickname','content','email','avatar','modelId']
        const xssData=zipObject(xssFilter,xssFilter.map(i=>xss(v.get(`body.${i}`))))
        await Message.create({
            ip,
            area,
            ...xssData
        })
    }
    async updateMessage(v,ctx) {
        const id=v.get(`body.id`)
        const message = await Message.findByPk(id);
        if (!message) {
            throw new NotFound({
                message: "没有找到相关留言"
            });
        }
        message.operateId=ctx.currentUser.id
        message.reply = v.get("body.reply")
        await message.save();
    }
    async getMessages(v,ctx) {
        const modelId=v.get("query.modelId")
        const condition={modelId}
        const page = v.get('query.page');
        const count1 = v.get('query.count');
        const filter={
            where: Object.assign({}, condition),
            offset: page * count1,
            limit: count1,
            order: [
                ['createdAt', 'DESC']
            ]
        }
        !ctx.currentUser && set(filter,'attributes',{exclude:['email','area','ip']})
        const { rows, count } = await Message.findAndCountAll(filter);
        return {
            rows,
            total: count
        };
    }
    
    async deleteMessage(id,options={}) {
        const message = await Message.findOne({
            where: {
                id
            }
        })
        if (!message) {
            throw new NotFound({
                message: '没有找到相关留言'
            })
        }
        await message.destroy(options)
    }
}

module.exports = {
    MessageDao
}
