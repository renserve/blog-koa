import {setFileActive} from "@middleware/file";

const { NotFound, Forbidden } = require("lin-mizar");
import sequelize from "@lib/db";
const { Category } = require("@model/cms/category");
import { Sequelize,Op } from 'sequelize';
import { set, get,isUndefined } from "lodash";
const { CategoryTag,Tag,ArticleCategory } = require('@model/article')
const { CategoryTagDao} = require('@dao/article/categoryTag')
const { Mood } = require("@model/article/mood");
const Q=require('q')
const categoryTagDao = new CategoryTagDao()
class CategoryDao {
    // 创建分类
    async createCategory(ctx,v) {
        const category = await Category.findOne({
            where: {
                name: v.get("body.name"),
                modelId: v.get("body.modelId")
            }
        });
        if (category) {
            throw new Forbidden({
                message: "已经存在该分类名"
            });
        }
        if(v.get("body.cover")){
            await setFileActive(v.get("body.cover"))
        }
        if(v.get("body.bgCover")){
            await setFileActive(v.get("body.bgCover"))
        }
        await sequelize.transaction(async t => {
            const result= await Category.create({
                name: v.get("body.name"),
                operateId: ctx.currentUser.id,
                modelId: v.get("body.modelId"),
                description: v.get("body.description"),
                cover: v.get("body.cover"),
                bgCover: v.get("body.bgCover")
            }, { transaction: t });
            const tags=v.get("body.tags")
            if(tags){
                const categoryId = result.getDataValue('id')
                await categoryTagDao.createCategoryTag(categoryId,tags,{ transaction: t })
            }
        })
       
    }
    
    // 修改分类
    async updateCategory(ctx,v) {
        const id=v.get(`body.id`)
        const operateId = ctx.currentUser.id;
        const category = await Category.findOne({
            where:{id},
            include:[
                {
                    model: Tag,
                    attributes: ['id','name'],
                    as: 'tags'
                }
            ]
        });
        if (!category) {
            throw new NotFound({
                message: "没有找到相关分类"
            });
        }
        const originTagId=category.tags.join(',')
        await sequelize.transaction(async t => {
            const tags=v.get(`body.tags`)
            if(originTagId!==tags){
                await categoryTagDao.updateCategoryTag(id,tags?tags:true, { transaction: t })
            }
            let isChange;
            await Q.all(['name','description','cover','bgCover'].map(async k=>{
                if(category[k]!==v.get(`body[${k}]`)){
                    isChange=true
                    category[k]=v.get(`body[${k}]`)
                    if(k==='bgCover' && v.get(`body[${k}]`)){
                        await setFileActive(v.get("body.bgCover"))
                    }
                    if(k==='cover' && v.get(`body[${k}]`)){
                        await setFileActive(v.get("body.cover"))
                    }
                }
            }))
            if(operateId!==category.operateId){
                isChange=true
                category.operateId=operateId
            }
            isChange && await category.save({ transaction: t })
        })
     
    }
    // 获取分类
    async getCategorys(v) {
        const modelId=v.get("query.modelId")
        const condition={modelId}
        const page = v.get('query.page');
        const count1 = v.get('query.count');
        const name=v.get("query.name")
        name && set(condition, 'name',{
            [Op.like]:`%${name}%`
        });
        if(!isUndefined(page) && !isUndefined(count1)){
            const { rows, count } = await Category.findAndCountAll({
                distinct:true,
                where: Object.assign({}, condition),
                offset: page * count1,
                limit: count1,
                include:[
                    {
                        model: Tag,
                        attributes: ['id','name','sort'],
                        as: 'tags'
                    }
                ],
                order: [
                    ["createdAt", "DESC"],
                    ['tags','sort']
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
                        model: Tag,
                        attributes: ['id','name','sort'],
                        as: 'tags'
                    }
                ])
                set(filter, 'order',[
                    ["createdAt", "DESC"],
                    ['tags','sort']
                ]);
            }else {
                set(filter, 'attributes',['id','name'])
            }
            return await Category.findAll(filter);
        }
    
    }
    
    // 删除分类
    async deleteCategory(ctx,id) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new NotFound({
                message: "没有找到相关分类"
            });
        }
        const article = await ArticleCategory.findOne({
            where: {
                category_id: id
            }
        })
        if (article) {
            throw new Forbidden({
                message: '该分类下有文章，禁止删除'
            })
        }
        const mood = await Mood.findOne({
            where: {
                categoryId:id
            }
        })
        if (mood) {
            throw new Forbidden({
                message: '该分类下有随笔，禁止删除'
            })
        }

        const tag = await CategoryTag.findOne({
            where: {
                category_id: id
            }
        })
        if (tag) {
            throw new Forbidden({
                message: '该分类下有标签，禁止删除'
            })
        }
        return await category.destroy()
    }
}

export {
    CategoryDao
};
