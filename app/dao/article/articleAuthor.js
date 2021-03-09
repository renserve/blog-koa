const { Op } = require("sequelize");

const { ArticleAuthor } = require("@model/article");
import { difference ,isBoolean,uniq} from "lodash";

class ArticleAuthorDao {
    async createArticleAuthor(articleId, authors, options = {}) {
        const arr = authors.split(",").map(Number);
        for (let i = 0; i < arr.length; i++) {
            await ArticleAuthor.create({
                article_id: articleId,
                author_id: arr[i]
            }, { ...options });
        }
    }
    
    //根据作者查文章
    async getArticleIds(authorId) {
        const result = await ArticleAuthor.findAll({
            where: {
                author_id: authorId
            }
        });
        return uniq(result.map(v => v.article_id));
    }
    
    //修改作者
    async updateArticleAuthor(articleId, authors='', options = {}) {
        if(isBoolean(authors)){
            //销毁所有
            await ArticleAuthor.destroy({
                where:{
                    article_id: articleId,
                },
                ...options
            });
            return true
        }
        const result = await ArticleAuthor.findAll({
            where: {
                article_id: articleId
            }
        });
        const originIds = result.map(v => v.author_id);
        const authorsIds = authors.split(",").map(Number);
        const destroyIds = difference(originIds, authorsIds);
        const createIds = difference(authorsIds, originIds);
        if (createIds.length) {
            for (let i = 0; i < createIds.length; i++) {
                await ArticleAuthor.create({
                    article_id: articleId,
                    author_id: createIds[i]
                }, { ...options });
            }
        }
        if (destroyIds.length) {
            await ArticleAuthor.destroy({
                where:{
                    article_id: articleId,
                    author_id: {
                        [Op.in]:destroyIds
                    }
                },
                ...options
            });
        }
    }
}

module.exports = {
    ArticleAuthorDao
};
