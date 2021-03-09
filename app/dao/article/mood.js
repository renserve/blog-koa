const { NotFound, Forbidden } = require("lin-mizar");
const { Mood ,requireModel} = require("@model/article/mood");
import { Op } from 'sequelize';
import { set,isUndefined,unset ,isNumber,omitBy} from "lodash";
import xss from 'xss'
import {setFileActive} from '@middleware/file'
const Q=require('q')
class MoodDao {
    // 创建随笔
    async createMood(v,ctx) {
        const mood={}
        const isBackground=v.get(`body.isBackground`)
        await Q.all(Object.keys(requireModel).concat(['cover','create_data','categoryId','tagId']).map(async k=>{
            let value=k==='create_data'?v.get(`body.create_time`):v.get(`body.${k}`)
            if(k==='cover' && value){
                await setFileActive(value)
            }
            if(k==='content' && value){
                await setFileActive(value)
            }
            if(k==='tagId' && value){
                value.split(',').map((id,index)=>{
                    mood[k+index]= Number(id) || null
                })
            }else {
                !isUndefined(value) && (mood[k]=isNumber(value)?value:xss(value))
            }
        }))
        mood.authorId=ctx.currentUser.id
        mood.operateId=ctx.currentUser.id
        await Mood.create(mood);
    }

    // 修改随笔
    async updateMood(v,ctx,isFront) {
        const id=v.get(`body.id`)
        const operateId = ctx.currentUser.id;
        const isBackground=v.get(`body.isBackground`)
        let mood ;
        if(isFront || ctx.currentUser.isLock){
            mood = await Mood.findOne({
                where:{
                    id,
                    authorId:ctx.currentUser.id
                }
            });
            if (!mood) {
                throw new Forbidden({
                    message: '没有操作权限'
                });
            }
        }else {
            mood = await Mood.findByPk(id);
            if (!mood) {
                throw new NotFound({
                    message: "没有找到相关随笔"
                });
            }
        }
        let isChange;
        await Q.all(Object.keys(requireModel).concat(['cover','create_data','categoryId','tagId']).map(async k=>{
            let value=k==='create_data'?v.get(`body.create_time`):v.get(`body.${k}`)
            if(k==='content'){
                console.log(value==mood[k])
            }
            if(value!==mood[k]){
                isChange=true
                if(k==='tagId' && value){
                    const tagIds=value.split(',').map(Number)
                    if(!tagIds.length){
                        ['tagId0','tagId1','tagId2'].map((tagId,index)=>{
                            mood[tagId]=null
                        })
                    }else {
                        ['tagId0','tagId1','tagId2'].map((tagId,index)=>{
                            if(tagIds[index]){
                                mood[tagId]=tagIds[index]
                            }else {
                                mood[tagId]=null
                            }
                        })
                    }
                }else {
                    if(k==='cover' && value){
                        await setFileActive(value)
                    }
                    if(k==='content' && value){
                        await setFileActive(value)
                    }
                    if(k==='categoryId'){
                        if(isNumber(value)){
                            mood[k]=value
                        }else {
                            mood[k]=null
                        }
                    }else {
                        !isUndefined(value) && (mood[k]=(isNumber(value) || isBackground)?value:xss(value))
                    }
                }
            }
        }))
        if(operateId!==mood.operateId){
            isChange=true
            mood.operateId=operateId
        }
        isChange && await mood.save();
    }

    // 获取随笔
    async getMoods(v,ctx,isFront) {
        const page = v.get('query.page');
        const tagId = v.get('query.tagId');
        const count1 = v.get('query.count');
        const content = v.get('query.content');
        const authorId = v.get('query.authorId');
        const create_data=v.get("query.create_data");
        const ids=v.get("query.ids")
        //多个作者只能查看自己的
        const condition={
            modelId:v.get("query.modelId"),
            public:ctx.currentUser?v.get('query.public'):0,
            categoryId:v.get('query.categoryId'),
            authorId:authorId,
        }
        if(create_data){
            const startDate=create_data.split(',')[0]
            const endDate=create_data.split(',')[1]
            set(condition, "create_data", { [Op.between]: [startDate, endDate] } );
        }
        ids && set(condition, 'id',{
            [Op.in]:ids.split(',').map(Number).filter(i=>i)
        });
        content && set(condition,'content',{[Op.like]: `%${content}%`})
        if(tagId){
            set(condition,[Op.or],[{tagId0:tagId},{tagId1:tagId},{tagId2:tagId}])
        }
        if(isFront && !authorId){
            set(condition,[Op.or],[
                {public:0},
                {authorId: ctx.currentUser.id}
            ]);
            unset(condition,'public')
        }
        const mergeCondition={
            where: omitBy(condition, isUndefined),
            order:[
                ["create_data", "DESC"]
            ],
            offset: page * count1,
            limit: count1
        }
        const { rows, count } = await Mood.findAndCountAll(mergeCondition);
        return {
            rows,
            total: count
        };
    }
    //批量删除
    async batchDeleteMoods(ids,ctx){
        if(ctx.currentUser.isLock){
            await Mood.destroy({
                where: {
                    [Op.and]:[
                        {id:{[Op.in]:ids}},
                        {authorId:ctx.currentUser.id},
                    ]

                }
            });
        }else {
            await Mood.destroy({
                where: {
                    id:{
                        [Op.in]:ids
                    }
                }
            });
        }
    }
    // 删除随笔
    async deleteMood(id,ctx) {
        let mood,condition={};
        if(ctx.currentUser.isLock){
            set(condition,'where',{
                authorId:ctx.currentUser.id,
                id
            })
            mood = await Mood.findOne(condition);
            if (!mood) {
                throw new Forbidden({
                    message: '没有操作权限'
                });
            }
        }else {
            mood = await Mood.findByPk(id);
            if (!mood) {
                throw new NotFound({
                    message: "没有找到相关随笔"
                });
            }
        }
        mood.destroy();
    }
}

export {
    MoodDao
};
