import { LinRouter, NotFound } from "lin-mizar";
import { PositiveIdValidator, PaginateValidator, RequiredValidator ,IsOptionalValidator} from "@validator/cms/common";
import {
     groupRequired,loginRequired
} from "@middleware/jwt";
import { logger } from '@middleware/logger';
import { requireModel } from "@model/article/article";
import { ArticleDao } from "@dao/article/article";

const articleApi = new LinRouter({
    prefix: "/web/article/article",
    module: "文章"
});
async function getList(ctx,isFront){
    const v=await new RequiredValidator({modelId:'模块类型'}).validate(ctx);
    const page=v.get("query.page")
    const count1=v.get("query.count")
    if(page && count1){
        const val=await new PaginateValidator().validate(ctx);
        const { rows,total } = await articleDao.getArticles(val,ctx,isFront)
        ctx.json({
            total,
            rows,
            page: v.get("query.page"),
            count: v.get("query.count")
        });
    }else {
        ctx.json(await articleDao.getArticles(v,ctx,isFront))
    }
}
const articleDao = new ArticleDao();

// 设置文章附加属性
articleApi.put("/subjoin", async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx);
    await articleDao.subjoinArticle(v);
    ctx.success({
        code: 3
    });
});


/**
 * @api {get} /cms/article/:id 获取文章详情
 * @apiName getArticleDetailModel
 * @apiParam [isFront] 是否web端(0否1是)
 * @apiVersion 1.0.1
 * @apiGroup 文章模块
 * @apiUse Authorization
 */
// 获取文章详情
articleApi.linGet("getArticleDetailModel", "/private/:id",
    loginRequired, async (ctx) => {
        const v = await new PositiveIdValidator().validate(ctx);
        const article = await articleDao.getArticle(ctx,v);
        ctx.body = article;
    });
/**
 * @api {get} /cms/article 查询文章
 * @apiName getAllArticleModel
 * @apiParam model 模块类型
 * @apiParam [categoryId] 分类ID
 * @apiParam [tagId] 文章标签(多个以英文逗号隔开)
 * @apiParam [public] 是否公开(0私密1公开)
 * @apiParam [authorId] 作者ID(多个以英文逗号隔开)
 * @apiParam [status] 是否发布(0草稿1发布)
 * @apiParam [star] 是否精选(0否1是)
 * @apiParam [search] 关键字搜索(检索关键字:标题，描述，内容)
 * @apiParam [startDate] 开始日期
 * @apiParam [endDate] 结束日期
 * @apiParam page 当前页
 * @apiParam count 分页个数
 * @apiVersion 1.0.1
 * @apiGroup 文章模块
 * @apiUse Authorization
 */
// 管理后台 获取全部文章
articleApi.linGet("getPrivateArticleModel", "/private", loginRequired, async (ctx) => {
    await getList(ctx,true)
});
// 管理后台 获取全部文章
articleApi.linGet("getAllArticleModel", "/all", loginRequired, async (ctx) => {
    await getList(ctx)
});
/**
 * @api {post} /cms/article 创建文章
 * @apiName createArticleModel
 * @apiParam title 文章标题
 * @apiParam description 文章描述
 * @apiParam content 文章内容
 * @apiParam model 模块类型
 * @apiParam [cover] 文章封面
 * @apiParam [created_time] 创建时间(UTC标准时间)
 * @apiParam categoryId 分类ID
 * @apiParam tagId 文章标签(多个以英文逗号隔开)
 * @apiParam public 是否公开(0私密1公开)
 * @apiParam authorId 作者ID(多个以英文逗号隔开)
 * @apiParam status 是否发布(0草稿1发布)
 * @apiParam star 是否精选(0否1是)
 * @apiVersion 1.0.1
 * @apiGroup 文章模块
 * @apiUse Authorization
 */

// 创建文章
articleApi.linPost("createArticleModel",
    "/",
    articleApi.permission("cms_article_add"),
    groupRequired,
    async (ctx) => {
        const v = await new RequiredValidator(requireModel,['cover','bgCover']).validate(ctx);
        await articleDao.createArticle(ctx,v);
        ctx.success({
            code: 1
        });
    });
/**
 * @api {put} /cms/article 更新文章
 * @apiName updateArticleModel
 * @apiParam title 文章标题
 * @apiParam description 文章描述
 * @apiParam content 文章内容
 * @apiParam model 模块类型
 * @apiParam [cover] 文章封面
 * @apiParam [created_time] 创建时间(UTC标准时间)
 * @apiParam categoryId 分类ID
 * @apiParam tagId 文章标签(多个以英文逗号隔开)
 * @apiParam public 是否公开(0私密1公开)
 * @apiParam authorId 作者ID(多个以英文逗号隔开)
 * @apiParam status 是否发布(0草稿1发布)
 * @apiParam star 是否精选(0否1是)
 * @apiVersion 1.0.1
 * @apiGroup 文章模块
 * @apiUse Authorization
 */
// 更新文章
articleApi.linPut("updateArticleModel:article", "/",
    articleApi.permission("cms_article_edit"),
    logger("{user.username}修改了文章（{request.body.title}）"),
    groupRequired,
    async (ctx) => {
        const v = await new RequiredValidator(requireModel,['cover','bgCover']).validate(ctx);
        await articleDao.updateArticle(ctx,v);
        ctx.success({
            code: 3
        });
    });

/**
 * @api {delete} /cms/article/:id 删除某篇文章
 * @apiName deleteArticleModel
 * @apiParam [isFront] 是否web端(0否1是)
 * @apiVersion 1.0.1
 * @apiGroup 文章模块
 * @apiUse Authorization
 */

// 删除某篇文章
articleApi.linDelete("deleteArticleModel:article",
    "/:id",
    articleApi.permission("cms_article_del"),
    logger("{user.username}删除了文章（{request.body.title}）",false),
    groupRequired,
    async (ctx) => {
        const v = await new PositiveIdValidator().validate(ctx);
        const id = v.get("path.id");
        await articleDao.deleteArticle(ctx,id);
        ctx.success({
            code: 2
        });
    });
/**
 * @api {put} /cms/article/subjoin 附加文章属性
 * @apiName subjoinArticleModel
 * @apiParam id ID
 * @apiParam [like] 点赞+1(0否1是)
 * @apiParam [comment] 评论+1(0否1是)
 * @apiParam [reward] 奖赏+1(0否1是)
 * @apiParam [collect] 收藏+1(0否1是)
 * @apiVersion 1.0.1
 * @apiGroup 文章模块
 * @apiUse Authorization
 */
// 设置文章附加属性
articleApi.linPut("subjoinArticleModel", "/subjoin", loginRequired, async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx);
    await articleDao.subjoinArticle(v);
    ctx.success({
        code: 3
    });
});
// 获取文章详情
articleApi.get("/:id",
    async (ctx) => {
        const v = await new PositiveIdValidator().validate(ctx);
        const article = await articleDao.getArticle(ctx,v);
        ctx.body = article;
    });
// 管理后台 获取全部文章
articleApi.get("/", async (ctx) => {
    await getList(ctx)
});


module.exports = articleApi;
