import { LinRouter, getTokens } from "lin-mizar";
import {
    RegisterValidator,
    LoginValidator,
    UpdateInfoValidator,
    ChangePasswordValidator
} from "@validator/cms/user";
import { PositiveIdValidator, RequiredValidator, IsOptionalValidator, PaginateValidator } from "@validator/cms/common";
import {
    adminRequired,
    loginRequired,
    refreshTokenRequiredWithUnifyException
} from "@middleware/jwt";
import { requireModel } from "@model/cms/model";
import { UserIdentityModel } from "@model/cms/user";
import { logger,writeLoginLog } from "@middleware/logger";
import { UserDao } from "@dao/cms/user";
import { TypeModelDao } from "@dao/cms/model";


const user = new LinRouter({
    prefix: "/cms/user",
    module: "用户"
});
const userDao = new UserDao();
const typeModelDao = new TypeModelDao();
/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization 用户授权token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer access_token",
 *     }
 */

/**
 * @apiDefine IsOptional
 * @apiParam [page] 当前页,不传不分页
 * @apiParam [count] 分页数量,不传不分页
 * @apiParam model 模块类型
 */

/**
 * @api {post} /cms/user/register 管理员注册用户
 * @apiName userRegister
 * @apiVersion 1.0.1
 * @apiGroup 管理员模块
 * @apiParam {String} username 用户名
 * @apiParam {String} password 密码
 * @apiParam {String} groupIds 分组
 * @apiParam {String} usermodel 用户所属模块
 * @apiParam {String} email 邮箱
 * @apiParam {String} groupIds 分组ID
 * @apiParam {String} nickname 昵称
 * @apiParam {String} avatar 头像
 * @apiUse Authorization
 */
user.linPost(
    "userRegister",
    "/register",
    user.permission("cms_user_add"),
    logger("{user.username}注册了用户（{request.body.username}）"),
    adminRequired,
    async ctx => {
        const v = await new RegisterValidator().validate(ctx);
        await userDao.createUser(v);
        ctx.success({
            code: 11
        });
    }
);

/**
 * @api {post} /cms/user/login 用户登录
 * @apiName userLogin
 * @apiVersion 1.0.1
 * @apiGroup 用户模块
 * @apiParam {String} username 用户名
 * @apiParam {String} password 密码
 * @apiSuccessExample Success-Response:
 *     {
 *       "access_token": "", token授权
 *       "refresh_token": "" token授权过期传refresh_token获取access_token
 *     }
 */
user.linPost("userLogin",
    "/login",
    async ctx => {
    const v = await new LoginValidator().validate(ctx);
    const username=v.get("body.username")
    const modelId=v.get("body.modelId")
    const user = await UserIdentityModel.verify(
        username,
        v.get("body.password")
    );
    const user_id=user.user_id
    const { accessToken, refreshToken } = getTokens({
        id: user_id
    });
    ctx.json({
        id: user.user_id,
        access_token: accessToken,
        refresh_token: refreshToken
    });
    await writeLoginLog({
        username,modelId,user_id,
        path:'/cms/user/login',
        message:username+'登录后台',
        method:'POST'
    })
});

/**
 * @api {put} /cms/user 更新用户信息
 * @apiName userUpdate
 * @apiVersion 1.0.1
 * @apiGroup 用户模块
 * @apiParam {String} [email] 邮箱
 * @apiParam {String} [nickname] 昵称
 * @apiParam {String} [avatar] 头像
 * @apiUse Authorization
 */
user.linPut(
    "userUpdate",
    "/",
    loginRequired,
    async ctx => {
        const v = await new UpdateInfoValidator().validate(ctx);
        await userDao.updateUser(ctx, v);
        ctx.success({
            code: 6
        });
    }
);

/**
 * @api {put} /cms/user/password 修改密码
 * @apiName userUpdatePassword
 * @apiVersion 1.0.1
 * @apiGroup 用户模块
 * @apiParam {String} old_password 旧密码
 * @apiParam {String} new_password 新密码
 * @apiParam {String} confirm_password 确认密码
 * @apiUse Authorization
 */
user.linPut(
    "userUpdatePassword",
    "/password",
    logger("{user.username}修改了密码",false),
    loginRequired,
    async ctx => {
        const user = ctx.currentUser;
        const v = await new ChangePasswordValidator().validate(ctx);
        await UserIdentityModel.changePassword(
            user,
            v.get("body.old_password"),
            v.get("body.new_password")
        );
        ctx.success({
            code: 4
        });
    }
);
/**
 * @api {get} /cms/user/refresh 刷新令牌token
 * @apiName userGetToken
 * @apiVersion 1.0.1
 * @apiGroup 用户模块
 * @apiHeader {String} Authorization refresh_token,令牌过期需重新存储
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer refresh_token",
 *     }
 */
user.linGet(
    "userGetToken",
    "/refresh",
    refreshTokenRequiredWithUnifyException,
    async ctx => {
        const user = ctx.currentUser;
        const { accessToken, refreshToken } = getTokens(user);
        ctx.json({
            access_token: accessToken,
            id:user.id,
            refresh_token: refreshToken
        });
    }
);
/**
 * @api {get} /cms/user/model 获取用户模块分类
 * @apiName getUserModel
 * @apiVersion 1.0.1
 * @apiGroup 全局Model模块
 * @apiUse Authorization
 */
user.linGet(
    "getUserModel",
    "/model",
    loginRequired,
    async ctx => {
        let v = await new IsOptionalValidator().validate(ctx);
        const page = v.get("query.page");
        const count1 = v.get("query.count");
        if (page && count1) {
            v = await new PaginateValidator().validate(ctx);
            const { rows, total } = await typeModelDao.getModel(v);
            ctx.json({
                rows,
                total: total,
                page: v.get("query.page"),
                count: v.get("query.count")
            });
        } else {
            ctx.json(await typeModelDao.getModel(v));
        }
    }
);
/**
 * @api {put} /cms/user/model 修改用户模块分类
 * @apiName changeUserModel
 * @apiVersion 1.0.1
 * @apiParam {number} id 模块ID
 * @apiParam {String} name 模块名字
 * @apiParam {number} [level] 是否锁定（1:是，2:否）
 * @apiParam {String} model 模块类型
 * @apiGroup 全局Model模块
 * @apiUse Authorization
 */
user.linPut(
    "changeUserModel",
    "/model",
    user.permission("cms_model_edit"),
    logger("{user.username}修改了模块（{request.body.name}）"),
    adminRequired,
    async ctx => {
        const v = await new RequiredValidator(requireModel).validate(ctx);
        await typeModelDao.updateModel(v);
        ctx.success({
            code: 3
        });
    }
);
/**
 * @api {post} /cms/user/model 新增用户模块分类
 * @apiName addUserModel
 * @apiVersion 1.0.1
 * @apiParam {String} name 模块名字
 * @apiParam {String} model 模块类型
 * @apiGroup 全局Model模块
 * @apiUse Authorization
 */
user.linPost(
    "addUserModel",
    "/model",
    user.permission("cms_model_add"),
    logger("{user.username}新增了模块（{request.body.name}）"),
    adminRequired,
    async ctx => {
        const v = await new RequiredValidator(requireModel).validate(ctx);
        await typeModelDao.createModel(v);
        ctx.success({
            code: 1
        });
    }
);
/**
 * @api {delete} /cms/user/model/:id 删除用户模块分类
 * @apiName deleteUserModel
 * @apiVersion 1.0.1
 * @apiGroup 全局Model模块
 * @apiUse Authorization
 */
user.linDelete(
    "deleteUserModel",
    "/model/:id",
    user.permission("cms_model_del"),
    logger("{user.username}删除模块（{request.body.name}）"),
    adminRequired,
    async ctx => {
        const v = await new PositiveIdValidator().validate(ctx);
        const id = v.get("path.id");
        await typeModelDao.deleteModel(id);
        ctx.success({
            code: 2
        });
    }
);


/**
 * @api {get} /cms/user/information 查询个人用户信息
 * @apiName getInformation
 * @apiVersion 1.0.1
 * @apiGroup 用户模块
 * @apiUse Authorization
 */
user.linGet(
    "getInformation",
    "/information",
    loginRequired,
    async ctx => {
        const info = await userDao.getInformation(ctx);
        ctx.json(info);
    }
);

export { user };
