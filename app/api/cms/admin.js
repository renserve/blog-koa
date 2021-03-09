import { LinRouter, Failed, NotFound } from "lin-mizar";
import { logger } from '@middleware/logger';
import {
    UpdateUserInfoValidator,
    UpdateGroupValidator,
    CreateGroupValidator,
    DispatchPermissionsValidator
} from "@validator/cms/admin";
import { PositiveIdValidator, PaginateValidator,IsOptionalValidator } from "@validator/cms/common";

import { adminRequired ,loginRequired} from "@middleware/jwt";
import { AdminDao } from "@dao/cms/admin";
import { MenuDao } from "@dao/cms/menu";
import { menu } from "./menu";

const admin = new LinRouter({
    prefix: "/cms/admin",
    module: "超管"
});

const adminDao = new AdminDao();
const menuDao = new MenuDao();


/**
 * @api {get} /cms/admin/users 查询所有用户
 * @apiName getAdminUsers
 * @apiVersion 1.0.1
 * @apiGroup 管理员模块
 * @apiParam group_id 分组ID
 * @apiUse IsOptional
 * @apiUse Authorization
 */
admin.linGet(
    "getAdminUsers",
    "/users",
    loginRequired,
    async ctx => {
        let v=await new IsOptionalValidator().validate(ctx);
        const page=v.get("query.page")
        const count1=v.get("query.count")
        if(page && count1){
            v=await new PaginateValidator().validate(ctx);
            const { rows,total } = await adminDao.getUsers(v,ctx);
            ctx.json({
                rows,
                total: total,
                page: v.get("query.page"),
                count: v.get("query.count")
            });
        }else {
            ctx.json(await  adminDao.getUsers(v,ctx));
        }
    }
);

/**
 * @api {delete} /cms/admin/user/:id 管理员删除用户
 * @apiName deleteUser
 * @apiVersion 1.0.1
 * @apiGroup 管理员模块
 * @apiUse Authorization
 */
admin.linDelete(
    "deleteUser",
    "/user/:id",
    admin.permission("cms_user_del"),
    logger("{user.username}删除了用户（{request.body.username}）"),
    adminRequired,
    async ctx => {
        const v = await new PositiveIdValidator().validate(ctx);
        const id = v.get("path.id");
        await adminDao.deleteUser(ctx, id);
        ctx.success({
            code: 5
        });
    }
);
/**
 * @api {put} /cms/admin/user 管理员更新用户信息
 * @apiName updateUser
 * @apiVersion 1.0.1
 * @apiParam {String} [groupIds] 分组
 * @apiParam {String} [username] 用户名
 * @apiParam {String} [password] 密码
 * @apiParam {String} [usermodel] 用户所属模块
 * @apiParam {String} [email] 邮箱
 * @apiParam {String} [nickname] 昵称
 * @apiParam {String} [avatar] 头像
 * @apiGroup 管理员模块
 * @apiUse Authorization
 */
admin.linPut(
    "updateUser",
    "/user",
    admin.permission("cms_user_edit"),
    logger("{user.username}修改了用户（{request.body.username}）"),
    adminRequired,
    async ctx => {
        const v = await new UpdateUserInfoValidator().validate(ctx);
        await adminDao.updateUserInfo(ctx, v);
        ctx.success({
            code: 6
        });
    }
);

/**
 * @api {get} /cms/admin/group 查询所有权限组
 * @apiName getAdminGroups
 * @apiVersion 1.0.1
 * @apiUse IsOptional
 * @apiGroup Group模块
 * @apiUse Authorization
 */
admin.linGet(
    "getAdminGroups",
    "/group",
    adminRequired,
    async ctx => {
        let v=await new IsOptionalValidator().validate(ctx);
        const page=v.get("query.page")
        const count1=v.get("query.count")
        if(page && count1){
            v=await new PaginateValidator().validate(ctx);
            const { rows,total } = await adminDao.getGroups(v)
            ctx.json({
                rows,
                total: total,
                page: v.get("query.page"),
                count: v.get("query.count")
            });
        }else {
            ctx.json(await adminDao.getGroups(v));
        }
    }
);

/**
 * @api {get} /cms/admin/group/:id 查询权限组权限
 * @apiName getGroup
 * @apiVersion 1.0.1
 * @apiGroup Group模块
 * @apiUse Authorization
 */
admin.linGet(
    "getGroup",
    "/group/:id",
    adminRequired,
    async ctx => {
        const v = await new PositiveIdValidator().validate(ctx);
        const group = await adminDao.getGroup(ctx, v.get("path.id"));
        ctx.json(group);
    }
);
/**
 * @api {get} /cms/admin/button 查询权限按钮
 * @apiName getButton
 * @apiVersion 1.0.1
 * @apiGroup Group模块
 * @apiUse Authorization
 */
admin.linGet(
    "getButton",
    "/button",
    adminRequired,
    async ctx => {
        const buttons = await adminDao.getButton();
        ctx.json(buttons);
    }
);
/**
 * @api {post} /cms/admin/group 新建权限组
 * @apiName createGroup
 * @apiVersion 1.0.1
 * @apiParam {String} name 分组名
 * @apiParam {String} model 模块类型
 * @apiParam {String} info 分组描述
 * @apiGroup Group模块
 * @apiUse Authorization
 */
admin.linPost(
    "createGroup",
    "/group",
    admin.permission("cms_group_add"),
    logger("{user.username}新增了分组（{request.body.name}）"),
    adminRequired,
    async ctx => {
        const v = await new CreateGroupValidator().validate(ctx);
        const ok = await adminDao.createGroup(ctx, v);
        if (!ok) {
            throw new Failed({
                code: 10027
            });
        }
        ctx.success({
            code: 15
        });
    }
);

/**
 * @api {put} /cms/admin/group 更新权限组
 * @apiName updateGroup
 * @apiVersion 1.0.1
 * @apiParam {String} name 分组名
 * @apiParam {String} model 模块类型
 * @apiParam {String} info 分组描述
 * @apiGroup Group模块
 * @apiUse Authorization
 */
admin.linPut(
    "updateGroup",
    "/group",
    admin.permission("cms_group_edit"),
    logger("{user.username}修改了分组（{request.body.name}）"),
    adminRequired,
    async ctx => {
        const v = await new UpdateGroupValidator().validate(ctx);
        await adminDao.updateGroup(ctx, v);
        ctx.success({
            code: 7
        });
    }
);

/**
 * @api {delete} /cms/admin/group/:id 删除权限组
 * @apiName deleteGroup
 * @apiVersion 1.0.1
 * @apiGroup Group模块
 * @apiUse Authorization
 */
admin.linDelete(
    "deleteGroup",
    "/group/:id",
    admin.permission("cms_group_del"),
    logger("{user.username}删除了分组（{request.body.name}）"),
    adminRequired,
    async ctx => {
        const v = await new PositiveIdValidator().validate(ctx);
        const id = v.get("path.id");
        await adminDao.deleteGroup(ctx, id);
        ctx.success({
            code: 8
        });
    }
);

/**
 * @api {post} /cms/admin/permission/dispatch/batch 分配多个权限
 * @apiName dispatchPermissions
 * @apiParam {Number} group_id 分组ID
 * @apiParam {String} menuIds 多个权限ID
 * @apiVersion 1.0.1
 * @apiGroup Group模块
 * @apiUse Authorization
 */
admin.linPost(
    "dispatchPermissions",
    "/permission/dispatch",
    admin.permission("cms_group_edit"),
    logger("{user.username}修改了分组（{request.body.name}）的权限"),
    adminRequired,
    async ctx => {
        const v = await new DispatchPermissionsValidator().validate(ctx);
        await adminDao.dispatchPermissions(ctx, v);
        ctx.success({
            code: 9
        });
    }
);

export { admin };
