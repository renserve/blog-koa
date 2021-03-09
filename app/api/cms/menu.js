import { LinRouter, Failed, NotFound, disableLoading } from "lin-mizar";
import { PositiveIdValidator, PaginateValidator,RequiredValidator,IsOptionalValidator } from "@validator/cms/common";

import { loginRequired, adminRequired } from "@middleware/jwt";
import { MenuDao } from "@dao/cms/menu";
import { requireModel,optionalModel } from '@model/cms/menu';
import { menuValidator } from "@validator/cms/menu";
import { logger } from "@middleware/logger";
import {difference} from 'lodash'
const menu = new LinRouter({
    prefix: "/cms/menu",
    module: "菜单"
});
const menuDao = new MenuDao();
/**
 * @api {get} /cms/menu 查询权限菜单
 * @apiName getMenus
 * @apiParam  [page]  分页
 * @apiParam  [count]  分页个数
 * @apiParam {string } model  模块名称
 * @apiParam {string } type  (top：顶部菜单 left：左侧菜单  button:按钮,多个逗号隔开)菜单类型
 * @apiParam {string } parentId  菜单父级ID
 * @apiVersion 1.0.1
 * @apiGroup 菜单模块
 * @apiUse Authorization
 */
menu.linGet(
    "getPermissionMenus",
    "/permission",
    loginRequired,
    async ctx => {
        const v=await new IsOptionalValidator().validate(ctx)
        const menus = await menuDao.getPermissionMenus(v,ctx);
        ctx.json(menus)
    }
);
/**
 * @api {get} /cms/menu 查询所有菜单
 * @apiName getMenus
 * @apiParam  [page]  分页
 * @apiParam  [count]  分页个数
 * @apiParam {string } model  模块名称
 * @apiParam {string } type  (top：顶部菜单 left：左侧菜单  button:按钮,多个逗号隔开)菜单类型
 * @apiParam {string } parentId  菜单父级ID
 * @apiVersion 1.0.1
 * @apiGroup 菜单模块
 * @apiUse Authorization
 */
menu.linGet(
    "getMenus",
    "/",
    adminRequired,
    async ctx => {
        const v=await new IsOptionalValidator().validate(ctx)
        if(v.get('query.page') && v.get('query.count')){
            const { menus, total } = await menuDao.getMenus(v);
            ctx.json({
                rows: menus,
                total,
                count: v.get("query.count"),
                page: v.get("query.page")
            });
        }else {
            const menus = await menuDao.getMenus(v);
            ctx.json(menus)
        }
    }
);
/**
 * @api {post} /cms/menu 新增菜单
 * @apiName createMenu
 * @apiVersion 1.0.1
 * @apiGroup 菜单模块
 * @apiUse Authorization
 * @apiParam {string } model 模块名称
 * @apiParam {int } parentId  =0 父级ID,顶级路由默认为0
 * @apiParam {string } title  名称
 * @apiParam {string} [name] 路由Name
 * @apiParam {string} [sort] 排序
 * @apiParam {string } path 路由
 * @apiParam {string} [icon] 图标
 * @apiParam {string } type (top：顶部菜单 left：左侧菜单  button:按钮)菜单类型
 * @apiParam {string } [permissionCode] 权限按钮code
 * @apiParamExample {json} Request-Example:
 *     {
 *       "id":"",
 *       "parentId": "",
 *       "title": "",
 *       "model": "",
 *       "name": "",
 *       "path": "",
 *       "icon": "",
 *       "type": "",
 *       "permissionCode": ""
 *     }
 */
menu.linPost(
    "createMenu",
    "/",
    menu.permission("cms_menu_add"),
    logger("{user.username}新增了菜单（{request.body.title}）"),
    adminRequired,
    async ctx => {
        const v = await new RequiredValidator({menumodel:"模块类型",...requireModel},optionalModel).validate(ctx);
        await menuDao.createMenu(v);
        ctx.success({
            code:1
        });
    }
);

/**
 * @api {put} /cms/menu 更新菜单
 * @apiName updateMenu
 * @apiVersion 1.0.1
 * @apiGroup 菜单模块
 * @apiUse Authorization
 * @apiParam {int} id  ID
 * @apiParam {string } model 模块名称
 * @apiParam {int } parentId  父级ID
 * @apiParam {string } title  名称
 * @apiParam {string} [name] 路由Name
 * @apiParam {string} [sort] 排序
 * @apiParam {string } path 路由
 * @apiParam {string} [icon] 图标
 * @apiParam {number } type (top：顶部菜单 left：左侧菜单  button:按钮)菜单类型
 * @apiParam {string } [permissionCode] 权限按钮code
 * @apiParamExample {json} Request-Example:
 *     {
 *       "id":"",
 *       "parentId": "",
 *       "title": "",
 *       "model": "",
 *       "name": "",
 *       "path": "",
 *       "icon": "",
 *       "type": "",
 *       "permissionCode": ""
 *     }
 */
menu.linPut(
    "updateMenu",
    "/",
    menu.permission("cms_menu_edit"),
    logger("{user.username}修改了菜单（{request.body.title}）"),
    adminRequired,
    async ctx => {
        const v = await new RequiredValidator(requireModel,difference(optionalModel,requireModel)).validate(ctx);
        await menuDao.updateMenu(v);
        ctx.success({
            code: 3
        });
    }
);
/**
 * @api {delete} /cms/menu/:id 删除菜单
 * @apiName deleteMenu
 * @apiVersion 1.0.1
 * @apiGroup 菜单模块
 * @apiUse Authorization
 */
menu.linDelete(
    "deleteMenu",
    "/:id",
    menu.permission("cms_menu_del"),
    logger("{user.username}删除了菜单（{request.body.title}）"),
    adminRequired,
    async ctx => {
        const v = await new PositiveIdValidator().validate(ctx);
        const id = v.get("path.id");
        await menuDao.deleteMenu(id);
        ctx.success({
            code: 2
        });
    }
);
export {menu}
