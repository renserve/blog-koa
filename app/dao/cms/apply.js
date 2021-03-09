const { NotFound, Forbidden } = require("lin-mizar");
const { Apply } = require("@model/cms/apply");
import { Sequelize,Op } from 'sequelize';
const { Article } = require("@model/article/article");
import { set, get,zipObject } from "lodash";
import xss from 'xss'
import {getUserIp, limitCount,getUserArea} from '@middleware/jwt-config'
class ApplyDao {
    async createApply(v,ctx) {
        const apply=await Apply.findOne({
            where:{
                email:v.get(`body.email`)
            }
        })
        if(!ctx.currentUser){
            if(apply){
                throw new Forbidden({
                    message: `入驻审核中，请耐心等待`
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
        return await Apply.create({
            ip,
            area,
            ...xssData
        })
    }
    async updateBatchApply(v,ctx) {
        const ids=v.get(`body.ids`).split(',').map(Number)
        for (let i = 0; i < ids.length; i++) {
            const apply = await Apply.findByPk(ids[i]);
            if(apply){
                apply.operateId=ctx.currentUser.id
                apply.reply = '<span class="pass">入驻申请已通过</span>'
                await apply.save();
            }
        }
    }
    async updateApply(v,ctx) {
        const id=v.get(`body.id`)
        const apply = await Apply.findByPk(id);
        if (!apply) {
            throw new NotFound({
                message: "没有找到相关入驻信息"
            });
        }
        apply.operateId=ctx.currentUser.id
        apply.reply = v.get("body.reply")
        await apply.save();
    }
    async getApply(v,ctx) {
        const page = v.get('query.page');
        const count1 = v.get('query.count');
        const reply = v.get('query.reply');
        const condition={};
        reply && set(condition, 'reply',{
            [Op.like]:`%${reply}%`
        });
        const filter={
            where: Object.assign({}, condition),
            offset: page * count1,
            limit: count1,
            order: [
                ['create_time', 'DESC']
            ]
        }
        !ctx.currentUser && set(filter,'attributes',{exclude:['email','content','area','ip']})
        const { rows, count } = await Apply.findAndCountAll(filter);
        return {
            rows,
            total: count
        };
    }

    async deleteApply(id,options={}) {
        const apply = await Apply.findByPk(id)
        if (!apply) {
            throw new NotFound({
                message: '没有找到相关入驻信息'
            })
        }
        await apply.destroy(options)
    }
}

module.exports = {
    ApplyDao
}
