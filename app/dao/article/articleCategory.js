const { Op } = require("sequelize");

const { ArticleCategory } = require("@model/article");
import { difference,isBoolean,set ,uniq} from "lodash";

class ArticleCategoryDao {
    async createArticleCategory(articleId, categories='', options = {}) {
        const arr = categories.split(",").map(Number);
        for (let i = 0; i < arr.length; i++) {
            await ArticleCategory.create({
                article_id: articleId,
                category_id: arr[i]
            }, { ...options });
        }
    }
    
    //根据分类查文章
    async getArticleIds(categoryId,currentId) {
        const condition={
            where: {
                category_id: {
                    [Op.in]:categoryId
                }
            }
        }
        const result = await ArticleCategory.findAll(condition);
        if(currentId){
            return uniq(result.map(v =>v.article_id)).filter(id=>id!==Number(currentId));
        }else {
            return uniq(result.map(v =>v.article_id));
        }
    }
    
    //修改分类
    async updateArticleCategory(articleId, categories='', options = {}) {
        if(isBoolean(categories)){
            //销毁所有
            await ArticleCategory.destroy({
                where:{
                    article_id: articleId,
                },
                ...options
            });
            return true
        }
        const result = await ArticleCategory.findAll({
            where: {
                article_id: articleId
            }
        });
        const originIds = result.map(v => v.category_id);
        const categoriesIds = categories.split(",").map(Number);
        const destroyIds = difference(originIds, categoriesIds);
        const createIds = difference(categoriesIds, originIds);
        if (createIds.length) {
            for (let i = 0; i < createIds.length; i++) {
                await ArticleCategory.create({
                    article_id: articleId,
                    category_id: createIds[i]
                }, { ...options });
            }
        }
        if (destroyIds.length) {
            await ArticleCategory.destroy({
                where:{
                    article_id: articleId,
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
    ArticleCategoryDao
};
