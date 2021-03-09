const { Op } = require("sequelize");

const { ArticleTag } = require("@model/article");
import { difference, isBoolean, uniq } from "lodash";

class ArticleTagDao {
    async createArticleTag(articleId, tags, options = {}) {
        const arr = tags.split(",").map(Number);
        for (let i = 0; i < arr.length; i++) {
            await ArticleTag.create({
                article_id: articleId,
                tag_id: arr[i]
            }, { ...options });
        }
    }
    
    //根据标签查文章
    async getArticleIds(tagId) {
        const result = await ArticleTag.findAll({
            where: {
                tag_id: tagId
            }
        });
        return uniq(result.map(v => v.article_id));
    }
    
    //修改标签
    async updateArticleTag(articleId, tags='', options = {}) {
        if(isBoolean(tags)){
            //销毁所有
            await ArticleTag.destroy({
                where:{
                    article_id: articleId,
                },
                ...options
            });
            return true
        }
        const result = await ArticleTag.findAll({
            where: {
                article_id: articleId
            }
        });
        const originIds = result.map(v => v.tag_id);
        const tagsIds = tags.split(",").map(Number);
        const destroyIds = difference(originIds, tagsIds);
        const createIds = difference(tagsIds, originIds);
        if (createIds.length) {
            for (let i = 0; i < createIds.length; i++) {
                await ArticleTag.create({
                    article_id: articleId,
                    tag_id: createIds[i]
                }, { ...options });
            }
        }
        if (destroyIds.length) {
            await ArticleTag.destroy({
                where:{
                    article_id: articleId,
                    tag_id: {
                        [Op.in]:destroyIds
                    },
                },
                ...options
            });
        }
    }
}

module.exports = {
    ArticleTagDao
};
