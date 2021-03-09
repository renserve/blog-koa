const { NotFound, Forbidden } = require("lin-mizar");
import sequelize from "@lib/db";
const { Tag } = require("@model/cms/tag");
import { Sequelize,Op } from 'sequelize';
import { set, get ,isUndefined} from "lodash";
const { CategoryTag,Category,ArticleTag } = require('@model/article')
const { Mood } = require("@model/article/mood");
const { CategoryTagDao} = require('@dao/article/categoryTag')
const categoryTagDao = new CategoryTagDao()
class TagDao {
    // 创建标签
    async createTag(ctx,v) {
        const tag = await Tag.findOne({
            where: {
                name: v.get("body.name"),
                modelId: v.get("body.modelId")
            }
        });
        if (tag) {
            throw new Forbidden({
                message: "已经存在该标签名"
            });
        }
        const categories=v.get("body.categories")
        await sequelize.transaction(async t => {
           const result= await Tag.create({
                operateId: ctx.currentUser.id,
                name: v.get("body.name"),
                sort: v.get("body.sort"),
                modelId: v.get("body.modelId")
            }, { transaction: t });
            const tagId = result.getDataValue('id')
            if(categories){
                await categoryTagDao.createTagCategory(tagId,categories, { transaction: t })
            }
        })
   
    }
    
    // 修改标签
    async updateTag(ctx,v) {
        const id=v.get(`body.id`)
        const tag = await Tag.findOne({
            where:{id},
            include:[
                {
                    model: Category,
                    attributes: ['id','name'],
                    as: 'categories'
                }
            ]
        });
        if (!tag) {
            throw new NotFound({
                message: "没有找到相关标签"
            });
        }
        const originIds=tag.categories.join(',')
        const categories=v.get("body.categories");
        const name=v.get("body.name")
        const sort=v.get("body.sort")
        await sequelize.transaction(async t => {
            if(categories!==originIds){
                await categoryTagDao.updateTagCategory(id, categories?categories:true, { transaction: t })
            }
            if(tag.name !== name || tag.sort !== sort){
                tag.name = name
                tag.sort = sort
                await tag.save({ transaction: t });
            }
        })
    }
    
    // 获取标签
    async getTags(v) {
        const modelId=v.get("query.modelId")
        const condition={modelId};
        const page = v.get('query.page');
        const count1 = v.get('query.count');
        const name=v.get("query.name")
        name && set(condition, 'name',{
            [Op.like]:`%${name}%`
        });
        if(!isUndefined(page) && !isUndefined(count1)){
            const { rows, count } = await Tag.findAndCountAll({
                distinct:true,
                where: Object.assign({},condition),
                offset: page * count1,
                limit: count1,
                include:[
                    {
                        model: Category,
                        attributes: ['id','name'],
                        as: 'categories'
                    }
                ],
                order: [
                    ["createdAt", "DESC"]
                ]
            });
            return {
                rows,
                total: count
            };
        }else {
            const forbid=v.get("query.forbid")
            const filter={
                where:Object.assign({}, condition),
            }
            if(!forbid){
                set(filter, 'include',[
                    {
                        model: Category,
                        attributes: ['id','name'],
                        as: 'categories'
                    }
                ])
            }else {
                set(filter, 'attributes',['id','name'])
            }
            return (await Tag.findAll(filter))
        }
     
    }
    
    // 删除标签
    async deleteTag(ctx,id) {
        const tag = await Tag.findByPk(id);
        if (!tag) {
            throw new NotFound({
                message: "没有找到相关标签"
            });
        }
        const article = await ArticleTag.findOne({
            where: {
                tag_id: id
            }
        })
        if (article) {
            throw new Forbidden({
                message: '该标签下有文章，禁止删除'
            })
        }
        const mood = await Mood.findOne({
            where: {
                [Op.or]: [{tagId0:id},{tagId1:id},{tagId2:id}]
            }
        })
        if (mood) {
            throw new Forbidden({
                message: '该标签下有随笔，禁止删除'
            })
        }

        const categories = await CategoryTag.findOne({
            where: {
                tag_id: id
            }
        })
        if (categories) {
            throw new Forbidden({
                message: '该标签下有分类，禁止删除'
            })
        }
        return (await tag.destroy())
    }
}

export {
    TagDao
};
