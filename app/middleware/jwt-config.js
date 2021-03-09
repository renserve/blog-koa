import {Forbidden} from "lin-mizar";
const axios = require('axios');
const { Category } = require("@model/cms/category");
const { Tag }  = require("@model/cms/tag");
const { Blacklist } = require("@model/cms/blacklist");
const { Message } = require("@model/cms/message");
const { Mood } = require("@model/article/mood");
import isString from 'lodash/isString'
const { Article } = require("@model/article/article");
import {Op} from 'sequelize';
//等级锁定
const limitCount={
    category:{
        count:[5,10],
    },
    tag:{
        count:[25,50],
    },
    //等级成长,用户管理
    message:{
        count:[15],
    },
    comment:{
        count:[30]
    }
}
function getUserIp(ctx){
    //todo x-forwarded-for伪造
    const ip= ctx.req.headers['x-forwarded-for'] ||
        ctx.req.connection.remoteAddress ||
        ctx.req.socket.remoteAddress ||
        ctx.req.connection.socket.remoteAddress;
    if(ip) {
        return ip.replace('::ffff:', '')
    }else {
        return '未知IP'
    }
}
async function getUserArea(ip){
    //todo x-forwarded-for伪造
    if(ip!=='未知IP'){
        const area=await axios.get(`https://restapi.amap.com/v3/ip?ip=${ip}&key=a8d4f0a5f02d44c6aa0edca2d4869135`)
        if(isString(area.city)){
            return area.province+area.city
        }else {
            return '未知地区'
        }
    }else {
        return '未知地区'
    }
}
function ipLimitCount(ctx,key='LIMIT_RECORD',value){
    const getIp=getUserIp(ctx);
    const ip=Buffer.from(getIp).toString('base64'),commentCount=ctx.cookies.get(key);
    if(!commentCount){
        ctx.cookies.set(key,JSON.stringify({ip,count:1,time:new Date().getTime()}),{maxAge:60000,overwrite:true});
    }else {
        const record=JSON.parse(commentCount)
        if(ip===record.ip){
            let count=record.count+1,reduiceTime=60000-(new Date().getTime()-record.time)
            if(reduiceTime<0){
                // ctx.cookies.set('MESSAGE_RECORD','',{maxAge:0,overwrite:true})
                ctx.cookies.set(key,JSON.stringify({ip,count:1,time:new Date().getTime()}),{maxAge:60000,overwrite:true})
            }else {
                //1分钟内超过2条请求
                if(count>value){
                    throw new Forbidden({
                        message: '操作频繁，请'+parseInt(reduiceTime/1000)+'秒后重试'
                    });
                }else {
                    ctx.cookies.set(key,JSON.stringify({ip,count,time:record.time},{maxAge:reduiceTime,overwrite:true}));
                }
            }
        }
    }
}
//权限颗粒operateId不可更改
const jwtMethods={
    article:{
        jwt:['updateArticleModel:article','deleteArticleModel:article'],
        async method(id,operateId){
            const result=await Article.findByPk(id)
            return  result.authorId.includes(Number(operateId))
        }
    },
    mood:{
        jwt:['changeMoodModel:mood','delMoodBatchModel:mood','delMoodModel:mood'],
        async method(id,operateId){
            if(/,/.test(id)){
                const results=await Mood.findAll({
                    where:{
                        id: {
                            [Op.in]: id.split(',').map(Number).filter(i=>i)
                        }
                    }
                })
                return !results.some(i=>i.authorId!==Number(operateId))
            }else {
                const result=await Mood.findByPk(id)
                return  result.authorId===Number(operateId)
            }
        }
    },
    idea:{
        jwt:['delIdeaListModel:idea','changeIdeaListModel:idea'],
        async method(id,operateId){
            const result=await Article.findByPk(id)
            return  result.authorId===Number(operateId)
        }
    },
    category:{
        jwt:['changeCategoryModel:category','delCategoryModel:category'],
        async method(id,operateId){
            const result=await Category.findByPk(id)
            return  result.operateId===Number(operateId)
        }
    },
    tag:{
        jwt:['changeTagModel:tag','delTagModel:tag'],
        async method(id,operateId){
            const result=await Tag.findByPk(id)
            return  result.operateId===Number(operateId)
        }
    },
    comment:{
        jwt:['changeCommentModel:comment','delCommentModel:comment'],
        async method(id,operateId){
            //依赖文章
            const result=await Article.findByPk(id)
            return  result.authorId.includes(Number(operateId))
        }
    },
    blacklist:{
        jwt:['addBlacklistFromCommentModel:blacklist','delBlacklistModel:blacklist'],
        async method(id,operateId,action){
            //依赖文章,拉黑,从文章，留言拉黑
            if(action==='addBlacklistFromCommentModel:blacklist'){
                const result=await Article.findByPk(id)
                return  result.authorId.includes(Number(operateId))
            }else {
                const result=await Blacklist.findByPk(id)
                return  result.operateId===Number(operateId)
            }
        }
    }
}
export {
    jwtMethods,
    limitCount,
    ipLimitCount,
    getUserIp,
    getUserArea
}
