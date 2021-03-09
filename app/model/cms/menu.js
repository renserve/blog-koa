import { Model, Sequelize, Op } from "sequelize";
import sequelize from "@lib/db";
import {has} from "lodash";
const requireModel={
    'parentId':"父级ID",'path':"菜单路由",'type':"菜单类型",'title':"标题"
}
const optionalModel=['name','icon','method','sort','permissionCode','id']
class Menu extends Model {
    toJSON() {
        const origin ={};
        const params=optionalModel.concat(Object.keys(requireModel))
        params.map(key=>{
            origin[key]=this[key]
        })
        has(this, "menumodel") && (origin.menumodel=this.menumodel?this.menumodel.map(i=>i.id):[])
        return origin;
    }
}
Menu.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        parentId: {
            type: Sequelize.INTEGER,
            comment: "父级路由ID",
            defaultValue: 0,
            allowNull: false
        },
        title: {
            type: Sequelize.STRING(60),
            comment: "路由名称，例如：网站设置",
            allowNull: false,
            defaultValue:"权限按钮"
        },
        name: {
            type: Sequelize.STRING(50),
            comment: "路由唯一NAME，例如：Home"
        },
        path: {
            type: Sequelize.STRING(60),
            comment: "路由路径",
            allowNull: false
        },
        method: {
            type: Sequelize.STRING(60),
            comment: "请求方式"
        },
        icon: {
            type: Sequelize.STRING(60),
            comment: "图标"
        },
        type: {
            type: Sequelize.STRING(60),
            comment: 'top：顶部菜单 left：左侧菜单  button:按钮',
            defaultValue:0,
            allowNull: false
        },
        permissionCode: {
            type: Sequelize.STRING(60),
            comment: "权限CODE，例如：图书"
        },
        sort : {
            type: Sequelize.INTEGER,
            comment: "排序",
            defaultValue: 0
        }
    },
    {
        sequelize,
        timestamps: false,
        tableName: "cms_menu"
    }
);

export { Menu as MenuModel,requireModel,optionalModel };
