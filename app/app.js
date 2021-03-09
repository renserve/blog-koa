import Koa from 'koa';
import KoaBodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import mount from 'koa-mount';
import serve from 'koa-static';

const helmet = require("koa-helmet");
import {config, json, logging, success, jwt, Loader} from 'lin-mizar';
import {PermissionModel} from '@model/cms/permission';

const {origin} = require('@config/config')
const compression = require('koa-compress')

/**
 *
 * 首页
 */
function indexPage(app) {
     app.context.loader.mainRouter.get('/', async ctx => {
    ctx.type = 'html';
    ctx.body = `<style type="text/css">*{ padding: 0; margin: 0; } div{ padding: 4px 48px;} a{color:#2E5CD5;cursor:
      pointer;text-decoration: none} a:hover{text-decoration:underline; } body{ background: #fff; font-family:
      "Century Gothic","Microsoft yahei"; color: #333;font-size:18px;} h1{ font-size: 100px; font-weight: normal;
      margin-bottom: 12px; } p{ line-height: 1.6em; font-size: 42px }</style><div style="padding: 24px 48px;"><p>
      Koa Success <br/><span style="font-size:30px">心上无垢，林间有风。</span></p></div> `;
  });
}

/**
 * 跨域支持
 * @apiParam app koa实例
 */
function applyCors(app) {
    app.use(cors({
        origin:process.env.NODE_ENV==='production'?origin: (ctx) => {
            const origin = ctx.headers.origin  // 实际生产请根据具体情况来进行规则配置
            return origin
        },   // 前端地址
        credentials: true
    }))
}

/**
 * 解析Body参数
 * @apiParam app koa实例
 */
function applyBodyParse(app) {
    // 参数解析
    app.use(KoaBodyParser());
}

/**
 * 静态资源服务
 * @apiParam app koa实例
 * @apiParam prefix 静态资源存放相对路径
 */
function applyStatic(app, prefix = '/assets') {
    const assetsDir = config.getItem('file.storeDir', 'app/static');
    app.use(mount(prefix, serve(assetsDir)));
}

/**
 * json logger 扩展
 * @apiParam app koa实例
 */
function applyDefaultExtends(app) {
    json(app);
    logging(app);
    success(app);
}

/**
 * loader 加载插件和路由文件
 * @apiParam app koa实例
 */
function applyLoader(app) {
    const pluginPath = config.getItem('pluginPath');
    const loader = new Loader(pluginPath, app);
    loader.initLoader();
}

/**
 * jwt
 * @apiParam app koa实例
 */
function applyJwt(app) {
    const secret = config.getItem('secret');
    jwt.initApp(app, secret);
}

/**
 * 初始化Koa实例
 */
async function createApp() {
    const app = new Koa();
    app.use(helmet());
    app.use(compression({
        threshold: 2048,
        gzip: {
            flush: require('zlib').constants.Z_SYNC_FLUSH
        }
    }));
    applyBodyParse(app);
    applyCors(app);
    applyStatic(app);
    const {log, error, Lin, multipart} = require('lin-mizar');
    // app.use(require('koa-static')(__dirname, 'apidoc'));
    app.use(log);
    app.on('error', error);
    applyDefaultExtends(app);
    applyLoader(app);
    applyJwt(app);
    const lin = new Lin();
    await lin.initApp(app, true); // 是否挂载插件路由，默认为true
    await PermissionModel.initPermission();
    indexPage(app);
    multipart(app);
    return app;
}

module.exports = {createApp};
