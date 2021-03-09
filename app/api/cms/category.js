import { LinRouter, NotFound } from 'lin-mizar';
import { set } from 'lodash';
import { PositiveIdValidator,PaginateValidator ,IsOptionalValidator,RequiredValidator} from "@validator/cms/common";
import {requireModel,optionalModel} from '@model/cms/category';
import {CategoryDao} from '@dao/cms/category'
import { adminRequired ,loginRequired,groupRequired} from "@middleware/jwt";
import { logger } from "@middleware/logger";
const category = new LinRouter({
    prefix: '/cms/category',
    module: "分类",
})

const categoryDao = new CategoryDao()

/**
 * @api {get} /cms/category 获取分类
 * @apiName getCategoryModel
 * @apiUse IsOptional
 * @apiVersion 1.0.1
 * @apiGroup 分类模块
 * @apiUse Authorization
 */

// 获取分类
category.linGet(
    'getCategoryModel',
    '/',
    loginRequired,
    async (ctx) => {
    let v=await new RequiredValidator({modelId:'模块类型'}).validate(ctx);
    const page=v.get("query.page")
    const count1=v.get("query.count")
    if(page && count1){
        v=await new PaginateValidator().validate(ctx);
        const { rows,total } = await categoryDao.getCategorys(v)
        ctx.json({
            rows,
            total: total,
            page: v.get("query.page"),
            count: v.get("query.count")
        });
    }else {
        ctx.json(await categoryDao.getCategorys(v));
    }
})
/**
 * @api {post} /cms/category 添加分类
 * @apiName addCategoryModel
 * @apiParam name 分类
 * @apiParam model 模块类型
 * @apiParam [description] 分类描述
 * @apiParam [cover] 分类封面
 * @apiVersion 1.0.1
 * @apiGroup 分类模块
 * @apiUse Authorization
 */
// 添加分类
category.linPost('addCategoryModel',
    '/',
    category.permission("cms_category_add"),
    groupRequired,
    async (ctx) => {
    const v = await new RequiredValidator(requireModel,optionalModel).validate(ctx)
    await categoryDao.createCategory(ctx,v)
    ctx.success({
        code:1
    });
})
/**
 * @api {put} /cms/category 修改分类
 * @apiName changeCategoryModel
 * @apiVersion 1.0.1
 * @apiParam id ID
 * @apiParam name 分类
 * @apiParam model 模块类型
 * @apiParam [description] 分类描述
 * @apiParam [cover] 分类封面
 * @apiGroup 分类模块
 * @apiUse Authorization
 */
// 修改分类
category.linPut('changeCategoryModel:category','/',
    category.permission("cms_category_edit"),
    logger("{user.username}修改了分类（{request.body.name}）"),
    groupRequired,  async (ctx) => {
    const v = await new RequiredValidator(requireModel,optionalModel).validate(ctx)
    await categoryDao.updateCategory(ctx,v)
    ctx.success({
        code:3
    });
})
/**
 * @api {delete} /cms/category/:id 删除分类
 * @apiName delCategoryModel
 * @apiVersion 1.0.1
 * @apiGroup 分类模块
 * @apiUse Authorization
 */
// 删除分类
category.linDelete('delCategoryModel:category','/:id',
    category.permission("cms_category_del"),
    logger("{user.username}删除了分类（{request.body.name}）"),
    groupRequired,  async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx)
    const id = v.get('path.id')
    const result=await categoryDao.deleteCategory(ctx,id)
    ctx.body={
        name:result.name,
        message:'删除成功'
    };
})
export {category }
