const { Op } = require("sequelize");

const { CategoryTag } = require("@model/article");
import { difference,isBoolean } from "lodash";

class CategoryTagDao {
    //创建分类
    async createCategoryTag(categoryId, tags='', options = {}) {
        const arr = tags.split(",").map(Number);
        for (let i = 0; i < arr.length; i++) {
            await CategoryTag.create({
                tag_id: arr[i],
                category_id: categoryId
            }, options);
        }
    }
    //创建标签
    async createTagCategory(tagId, categories='', options = {}) {
        const arr = categories.split(",").map(Number);
        for (let i = 0; i < arr.length; i++) {
            await CategoryTag.create({
                tag_id: tagId,
                category_id: arr[i]
            }, options);
        }
    }
    //修改分类
    async updateCategoryTag(categoryId, tags='', options = {}) {
        if(isBoolean(tags)){
            //销毁所有
            await CategoryTag.destroy({
                where:{
                    category_id: categoryId,
                },
                ...options
            });
            return
        }
        const result = await CategoryTag.findAll({
            where: {
                category_id: categoryId
            }
        });
        const originIds = result.map(v => v.tag_id);
        const tagsIds = tags.split(",").map(Number);
        const destroyIds = difference(originIds, tagsIds);
        const createIds = difference(tagsIds, originIds);
        if (createIds.length) {
            for (let i = 0; i < createIds.length; i++) {
                await CategoryTag.create({
                    category_id: categoryId,
                    tag_id: createIds[i]
                },options);
            }
        }
        if (destroyIds.length) {
            await CategoryTag.destroy({
                where:{
                    category_id: categoryId,
                    tag_id: {
                        [Op.in]:destroyIds
                    },
                },
                ...options
            });
        }
    }

    //修改标签
    async updateTagCategory(tagId, categories='', options = {}) {
        if(isBoolean(categories)){
            //销毁所有
            await CategoryTag.destroy({
                where:{
                    tag_id: tagId,
                },
                ...options
            });
            return true
        }
        const result = await CategoryTag.findAll({
            where: {
                tag_id: tagId
            }
        });
        const originIds = result.map(v => v.category_id);
        const categoriesIds = categories.split(",").map(Number);
        const destroyIds = difference(originIds, categoriesIds);
        const createIds = difference(categoriesIds, originIds);
        if (createIds.length) {
            for (let i = 0; i < createIds.length; i++) {
                await CategoryTag.create({
                    tag_id: tagId,
                    category_id: createIds[i]
                }, options);
            }
        }
        if (destroyIds.length) {
            await CategoryTag.destroy({
                where:{
                    tag_id: tagId,
                    category_id: {
                        [Op.in]:destroyIds
                    },
                },
                ...options
            });
        }
    }
}

module.exports = {
    CategoryTagDao
};
