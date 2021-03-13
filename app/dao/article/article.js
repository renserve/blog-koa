import sequelize from "@lib/db";

const { Op } = require("sequelize");

import { NotFound } from "lin-mizar";

const { requireModel } = require("@model/article/article");
const { ArticleTagDao } = require("@dao/article/articleTag");
const { ArticleAuthorDao } = require("@dao/article/articleAuthor");
const { ArticleCategoryDao } = require("@dao/article/articleCategory");
const { ArticleCategory } = require("@model/article/articleCategory");
const articleTagDao = new ArticleTagDao();
const articleAuthorDao = new ArticleAuthorDao();
const articleCategoryDao = new ArticleCategoryDao();
const { Article, Tag, UserModel, Comment, Category } = require("@model/article");
import { set, intersection, compact, isUndefined ,unset,omitBy, isNaN } from "lodash";
import {setFileActive} from "@middleware/file";

class ArticleDao {
    async createArticle(ctx, v) {
        if(v.get("body.cover")){
            await setFileActive(v.get("body.cover"))
        }
        if(v.get("body.bgCover")){
            await setFileActive(v.get("body.bgCover"))
        }
        if(v.get("body.content")){
            await setFileActive(v.get("body.content"))
        }
        await sequelize.transaction(async t => {
            const result = await Article.create({
                title: v.get("body.title"),
                content: v.get("body.content"),
                description: v.get("body.description"),
                cover: v.get("body.cover"),
                bgCover: v.get("body.bgCover"),
                create_data: v.get("body.create_time"),
                categoryId: v.get("body.categoryId"),
                operateId: ctx.currentUser.id,
                tagId: v.get("body.tagId"),
                articleType: v.get("body.articleType"),
                public: v.get("body.public"),
                authorId: v.get("body.authorId"),
                modelId: v.get("body.modelId"),
                username: ctx.currentUser.username,
                star: v.get("body.star")
            }, { transaction: t });
            const articleId = result.getDataValue("id");
            await articleTagDao.createArticleTag(articleId, v.get("body.tagId"), { transaction: t });
            await articleAuthorDao.createArticleAuthor(articleId, v.get("body.authorId"), { transaction: t });
            await articleCategoryDao.createArticleCategory(articleId, v.get("body.categoryId"), { transaction: t });
        });
    }

    // 编辑某篇文章
    async updateArticle(ctx, v) {
        const id = v.get("body.id");
        const article = await Article.findByPk(id);
        if (!article) {
            throw new NotFound({
                message: "没有找到相关文章"
            });
        }
        const originTagId = article.tagId;
        const originCategoryId = article.categoryId;
        const originAuthorId = article.authorId;
        const tagId = v.get(`body.tagId`);
        const categoryId = v.get(`body.categoryId`);
        const authorId = v.get(`body.authorId`);
        const operateId = ctx.currentUser.id;
        await sequelize.transaction(async t => {
            if (tagId !== originTagId) {
                await articleTagDao.updateArticleTag(id, tagId, { transaction: t });
            }
            if (categoryId !== originCategoryId) {
                await articleCategoryDao.updateArticleCategory(id, categoryId, { transaction: t });
            }
            if (authorId !== originAuthorId) {
                await articleAuthorDao.updateArticleAuthor(id, authorId, { transaction: t });
            }
            let isChange;
            Object.keys(requireModel).concat(["cover", "bgCover"]).map(k => {
                let val = v.get(`body.${k}`);
                if(article[k] !== val){
                    isChange=true
                    article[k] = val
                }
            });
            if(v.get("body.cover") && v.get("body.cover")!==article.cover){
                await setFileActive(v.get("body.cover"))
            }
            if(v.get("body.bgCover") && v.get("body.bgCover")!==article.bgCover){
                await setFileActive(v.get("body.bgCover"))
            }
            if(v.get("body.content") && v.get("body.content")!==article.content){
                await setFileActive(v.get("body.content"))
            }
            if(v.get(`body.create_time`)!==article.create_data){
                isChange=true
                article.create_data = v.get(`body.create_time`)
            }
            if(operateId!==article.operateId){
                isChange=true
                article.operateId=operateId
            }
            isChange && await article.save({ transaction: t });
        });
    }

    // 获取文章详情
    async getArticle(ctx, v) {
        const id=v.get("path.id")
        const view=v.get("query.view")
        const condition = {
            where: {id},
            attributes:{ exclude: ["operateId","authorId", "tagId", "categoryId"] },
            include: [
                {
                    model: UserModel,
                    attributes: ["id", "nickname", "avatar"],
                    as: "authors"
                },
                {
                    model: Tag,
                    attributes: ["id", "name"],
                    as: "tags"
                },
                {
                    model: Category,
                    attributes: ["id", "name"],
                    as: "categories"
                }
            ]
        };
        const article = await Article.findOne(condition);
        if(!article || !ctx.currentUser && article.public){
            //未登录获取私密
            throw new NotFound({
                message: "没有找到相关文章"
            });
        }
        //该分类下文章数量,私密文章不准确
        const articleCount = await ArticleCategory.count({
            where: {
                category_id: {[Op.in]: article.categories.map(i => i.id)}
            }
        });
        articleCount && set(article, "total", articleCount - 1);
        if(Number(view)){
            await article.increment("views");
        }
        return article;
    }
    async subjoinArticle(v, options = {}) {
        const id = v.get("body.id");
        const article = await Article.findByPk(id);
        if (!article) {
            throw new NotFound({
                message: "没有找到相关文章"
            });
        }
        v.get("body.like") && await article.increment("like");
        v.get("body.reward") && await article.increment("reward");
        v.get("body.collect") && await article.increment("collect");
    }
    //删除文章同时删除评论
    async deleteArticle(ctx, id) {
        const article = await Article.findByPk(id);
        if (!article) {
            throw new NotFound({
                message: "没有找到相关文章"
            });
        }
        await sequelize.transaction(async t => {
            await articleTagDao.updateArticleTag(id, true, { transaction: t });
            await articleCategoryDao.updateArticleCategory(id, true, { transaction: t });
            await articleAuthorDao.updateArticleAuthor(id, true, { transaction: t });
            await Comment.destroy({
                where: {
                    classId: id
                },
                transaction: t
            });
            await article.destroy({ transaction: t });
        });
    }
    //条件查询文章
    async getArticles(v, ctx,isFront) {
        const page = v.get("query.page");
        const count1 = v.get("query.count");
        const keyword = v.get("query.search") || v.get("query.content");
        const archive = v.get("query.archive");
        const create_data=v.get("query.create_data");
        const modelId = v.get("query.modelId");
        // step1: 获取筛选条件
        const condition = omitBy({
            modelId,
            public:ctx.currentUser?v.get('query.public'):0,
            star: v.get("query.star")
        }, isUndefined);
        // step2:获取交集
        const currentId = v.get("query.id");
        const categoryId = v.get("query.categoryId");
        const handleCategoryId=categoryId && categoryId.split(',').map(Number)
        const authorId = v.get("query.authorId");
        const tagId = v.get("query.tagId");
        const limitClassify = compact([
            categoryId && await articleCategoryDao.getArticleIds(handleCategoryId,currentId),
            authorId && await articleAuthorDao.getArticleIds(authorId),
            tagId && await articleTagDao.getArticleIds(tagId)
        ]);
        if (limitClassify.length) {
            const intersectionIds = intersection(...limitClassify);
            if (!intersectionIds.length) {
                return {
                    rows: [],
                    total: 0
                };
            } else {
                set(condition, "id", { [Op.in]:intersectionIds })
            }
        }
        if(create_data){
            const startDate=create_data.split(',')[0]
            const endDate=create_data.split(',')[1]
            set(condition, "create_data", { [Op.between]: [startDate, endDate] } );
        }
        const search = keyword && {
            [Op.or]: [
                {
                    title: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    description: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    content: {
                        [Op.like]: `%${keyword}%`
                    }
                }
            ]
        };
        if(isFront && !authorId){
            set(condition,[Op.or],[
                {public:0},
                {authorId: ctx.currentUser.id}
            ]);
            unset(condition,'public')
        }
        // step3: 构建查询条件
        const mergeCondition = {
            where: {
                ...condition,
                ...(search || {})
            }
        };
        if(isFront || !ctx.currentUser){
            set(mergeCondition, "attributes",{ exclude: ["content","operateId", "authorId", "tagId", "categoryId"] });
            set(mergeCondition, "distinct", true);
            if(!search){
                if(archive){
                    set(mergeCondition, "include", [
                        {
                            model: UserModel,
                            attributes: ["id", "nickname", "avatar"],
                            as: "authors"
                        }
                    ]);
                }else {
                    set(mergeCondition, "include", [
                        {
                            model: Comment,
                            attributes: ["id"],
                            as: 'comments',
                        },
                        {
                            model: UserModel,
                            attributes: ["id", "nickname", "avatar"],
                            as: "authors"
                        },
                        {
                            model: Tag,
                            attributes: ["id", "name"],
                            as: "tags"
                        },
                        {
                            model: Category,
                            attributes: ["id", "name"],
                            as: "categories"
                        }
                    ]);
                }
            }
            set(mergeCondition, "order", [
                ["create_data", "DESC"]
            ])
            if (isUndefined(page) && isUndefined(count1)) {
                return await Article.findAll(mergeCondition);
            }
        }else {
            set(mergeCondition, "order", [
                ["star", "DESC"],
                ["create_data", "DESC"]
            ]);
            set(mergeCondition, "include", [
                {
                    model: Comment,
                    attributes: ["id"],
                    as: 'comments',
                },
            ]);
        }
        set(mergeCondition,'offset',page * count1)
        set(mergeCondition,'limit',count1)
        const { rows, count } = await Article.findAndCountAll(mergeCondition);
        return {
            rows,
            total: count
        };
    }
}
module.exports = {
    ArticleDao
};
