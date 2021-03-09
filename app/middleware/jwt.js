import {
    NotFound,
    AuthFailed,
    parseHeader,
    RefreshException,
    TokenType,
    routeMetaInfo
} from "lin-mizar";
import { UserGroupModel } from "@model/cms/user-group";
import { GroupModel } from "@model/cms/group";
import { MenuModel } from "@model/cms/menu";
import { UserModel } from "@model/cms/user";
//验证model
import {jwtMethods} from "@middleware/jwt-config"
const {TypeModel } = require("@model/cms");
import { MountType, GroupLevel } from "@lib/type";
import { Op } from "sequelize";
import { union,flatten,map,isArray} from "lodash";
const jwtRouterName=flatten(map(jwtMethods,'jwt'))
// 是否超级管理员
export async function isAdmin(ctx) {
    const userGroup = await UserGroupModel.findAll({
        where: {
            user_id: ctx.currentUser.id
        }
    });
    const groupIds = userGroup.map(v => v.group_id);
    const is = await GroupModel.findOne({
        where: {
            level: GroupLevel.Root,
            id: {
                [Op.in]: groupIds
            }
        }
    });
    return is;
}

/**
 * 将 user 挂在 ctx 上
 */
async function mountUser(ctx) {
    const {identity} = parseHeader(ctx);
    const user = await UserModel.findOne({
        where: {
            id: identity
        },
        include: [
            {
                model: TypeModel,
                attributes: ["id", "name"],
                as: "usermodel"
            }
        ]
    });
    if (!user) {
        throw new NotFound({
            code: 10021
        });
    }
    ctx.currentUser = user;
}
async function isApiAllow(ctx, next){
    if (ctx.matched) {
        const routeName = ctx._matchedRouteName || ctx.routerName;
        //颗粒控制，operateId
        if(jwtRouterName.includes(routeName)){
            const method=routeName.split(':')[1]
            const body=ctx.request.body,query=ctx.request.query,params=ctx.params;
            const id=body && (body.id || body.ids) || query && (query.id || query.ids) || params.id
            if(await jwtMethods[method].method(id,ctx.currentUser.id,routeName)){
                await next()
                return;
            }else {
                throw new AuthFailed({
                    code: 10001
                });
            }
        }
        const endpoint = `${ctx.method} ${routeName}`;
        const notAllow=routeMetaInfo.get(endpoint)
        if(!notAllow){
            await next();
            return;
        }
        const { permission } = routeMetaInfo.get(endpoint);
        const userGroup = await UserGroupModel.findAll({
            where: {
                user_id: ctx.currentUser.id
            }
        });
        const groupIds = userGroup.map(v => v.group_id);
        const groupPermission = await GroupModel.findAll({
            where: {
                id: {
                    [Op.in]: groupIds
                }
            }
        });
        const permissionIds = union(flatten(groupPermission.map(v => v.authIds?v.authIds.split(',').map(Number):v.authIds)));
        const item = await MenuModel.findOne({
            where: {
                id: {
                    [Op.in]: permissionIds
                },
                permissionCode: permission,
            }
        });
        if (item) {
            await next();
        } else {
            throw new AuthFailed({
                code: 10001
            });
        }
    } else {
        throw new AuthFailed({
            code: 10001
        });
    }
}
/**
 * 守卫函数，非超级管理员不可访问
 */
async function adminRequired(ctx, next) {
    if (ctx.request.method !== "OPTIONS") {
        await mountUser(ctx);
        if (await isAdmin(ctx)) {
            if(ctx.currentUser.isLock){
                await isApiAllow(ctx,next)
            }else {
                await next();
            }
        } else {
            throw new AuthFailed({
                code: 10001
            });
        }
    } else {
        await next();
    }
}

/**
 * 守卫函数，用户登陆即可访问
 */
async function loginRequired(ctx, next) {
    if (ctx.request.method !== "OPTIONS") {
        await mountUser(ctx);
        await next();
    } else {
        await next();
    }
}

/**
 * 守卫函数，用户刷新令牌，统一异常
 */
async function refreshTokenRequiredWithUnifyException(ctx, next) {
    if (ctx.request.method !== "OPTIONS") {
        try {
            const { identity } = parseHeader(ctx, TokenType.REFRESH);
            const user = await UserModel.findByPk(identity);
            if (!user) {
                ctx.throw(
                    new NotFound({
                        code: 10021
                    })
                );
            }
            // 将user挂在ctx上
            ctx.currentUser = user;
        } catch (error) {
            throw new RefreshException();
        }
        await next();
    } else {
        await next();
    }
}

/**
 * 守卫函数，用于权限组鉴权
 */
async function groupRequired(ctx, next) {
    if (ctx.request.method !== "OPTIONS") {
        await mountUser(ctx);
        // 超级管理员
        if (await isAdmin(ctx) && !ctx.currentUser.isLock) {
            await next();
        } else {
            await isApiAllow(ctx,next)
        }
    } else {
        await next();
    }
}

export {
    adminRequired,
    loginRequired,
    groupRequired,
    refreshTokenRequiredWithUnifyException
};
