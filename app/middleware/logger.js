import { get } from "lodash";
import { routeMetaInfo, assert } from "lin-mizar";
import { LogModel } from "@model/cms/log";

const REG_XP = /(?<=\{)[^}]*(?=\})/g;
// const REG_XP =new RegExp('(?<=\{)[^}]*(?=\})','g');
/**
 * 日志记录中间件
 * @apiParam template 消息模板
 *
 * ```js
 * test.linGet(
 *  "getTestMessage",
 * "/json",
 *  {
 *   permission: "hello",
 *   module: "world",
 *   mount: true
 * },
 * loginRequired,
 * logger("{user.username}就是皮了一波"),
 * async ctx => {
 *   ctx.json({
 *     message: "物质决定意识，经济基础决定上层建筑"
 *   });
 *  }
 * );
 * ```
 */
export const logger = (template,isRecord=true) => {
    return async (ctx, next) => {
        await next();
        // 取数据，写入到日志中
        writeLog(template, ctx,isRecord);
    };
};
export async function writeLoginLog({user_id,username,modelId,message,method,path}){
    await LogModel.createLog(
        {
            message,
            user_id,
            username,
            modelId,
            status_code: 0,
            method,
            path,
        },
        true
    );
}
function writeLog(template, ctx,isRecord) {
    let message = parseTemplate(
        template,
        ctx.currentUser,
        ctx.response,
        ctx.request
    );
    if (ctx.matched) {
        const info = findAuthAndModule(ctx);
        let permission = "";
        if (info) {
            permission = get(info, "permission");
        }
        const body=ctx.request.body
        let content = isRecord?(body && JSON.stringify(body.oldData) || null):null
        if(body.isRecord){
            content=null
            message=message+`（${body.isRecord}）`
        }
        const statusCode = ctx.status || 0;
        LogModel.createLog(
            {
                message,
                content,
                user_id: ctx.currentUser.id,
                username: ctx.currentUser.username,
                modelId: body && body.modelId || null,
                status_code: statusCode,
                method: ctx.request.method,
                path: ctx.request.path,
                permission
            },
            true
        );
    }
}

/**
 * 通过当前的路由名找到对应的权限录入信息
 * @apiParam ctx koa 的 context
 */
function findAuthAndModule(ctx) {
    const routeName = ctx._matchedRouteName || ctx.routerName;
    const endpoint = `${ctx.method} ${routeName}`;
    return routeMetaInfo.get(endpoint);
}

/** f
 * 解析模板
 * @apiParam template 消息模板
 * @apiParam user 用户
 * @apiParam response
 * @apiParam request
 */
function parseTemplate(template, user, response, request) {
    const res = template.match(REG_XP);
    if (res) {
        res.forEach(item => {
            const index = item.indexOf(".");
            assert(index !== -1, item + "中必须包含 .");
            const preferredKey = item.substring(0, index);
            const prop = item.substring(index + 1, item.length);
            let it;
            switch (preferredKey) {
                case "user":
                    it = get(user, prop, "");
                    break;
                case "response":
                    it = get(response, prop, "");
                    break;
                case "request":
                    it = get(request, prop, "");
                    break;
                default:
                    it = "";
                    break;
            }
            template = template.replace(`{${item}}`, it);
        });
    }
    return template;
}
