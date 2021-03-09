import { NotFound, Forbidden, Failed } from "lin-mizar";
import Sequelize from "sequelize";
import { MenuModel, requireModel, optionalModel } from "@model/cms/menu";

const Op = Sequelize.Op;
import { GroupModel } from "@model/cms/group";
import { UserGroupModel } from "@model/cms/user-group";
import { MenuTypeModel ,TypeModel} from "@model/cms";
import { isAdmin } from "@middleware/jwt";
import {set, union, flatten, concat, intersection, isEqual} from "lodash";
import sequelize from "@lib/db";
class MenuDao {
    //授权菜单访问
    async getPermissionMenus(v, ctx) {
        const model_id=v.get("query.modelId")
        const group_id=v.get("query.groupId")
        const isLock = ctx.currentUser.isLock;
        const groupIds = await UserGroupModel.findAll({
            where: {
                user_id: ctx.currentUser.id
            }
        });
        let groupPermission;
        if(group_id){
            groupPermission=[await GroupModel.findByPk(group_id)]
        }else {
            groupPermission=await GroupModel.findAll({
                where: {
                    id: {[Op.in]: groupIds.map(i=>i.group_id)}
                }
            });
        }
        if (!groupPermission) {
            throw new Failed({
                message: "请联系管理员授权"
            });
        }
        const menuTypeIds=await MenuTypeModel.findAll({
            where: {
                model_id
            }
        });
        const condition = {};
        const typeIds=menuTypeIds.map(item=>item.menu_id)
        //模块菜单
        const menuIds = union(flatten(groupPermission.map(v => v.menuIds ? v.menuIds.split(",").map(Number) : v.menuIds)));
        const authIds = union(flatten(groupPermission.map(v => v.authIds ? v.authIds.split(",").map(Number) : v.authIds)));
        const permissionIds = intersection(typeIds,concat(menuIds, authIds));
        if (isLock || !await isAdmin(ctx) || group_id) {
            set(condition, "id", { [Op.in]: permissionIds });
        }
        if(permissionIds.length){
            const menus = await MenuModel.findAll({
                where: Object.assign({}, condition),
                order: [
                    ["sort"]
                ]
            });
            return menus;
        }else {
            return [];
        }
    }
    
    async getMenus(v) {
        const model_id = v.get("query.modelId");
        const menuTypeIds=await MenuTypeModel.findAll({
            where: {
                model_id
            }
        });
        const typeIds=menuTypeIds.map(item=>item.menu_id)
        const condition = {
            id:{ [Op.in]: typeIds }
        };
        const start = v.get("query.page");
        const count1 = v.get("query.count");
        v.get("query.parentId") && set(condition, "parentId", v.get("query.parentId"));
        if (start && count1) {
            const { rows, count } = await MenuModel.findAndCountAll({
                where: Object.assign({}, condition),
                offset: page * count1,
                order: [
                    ["sort"]
                ],
                limit: count1
            });
            return {
                menus: rows,
                total: count
            };
        } else {
            const menus = await MenuModel.findAll({
                where: Object.assign({}, condition),
                include:{
                    model: TypeModel,
                    attributes: ["id"],
                    as: 'menumodel',
                },
                order: [
                    ["sort"]
                ]
            });
            return menus;
        }
    }
    
    async createMenu(v) {
        const menumodel=v.get("body.menumodel").split(',').map(Number)
        const menu = await MenuModel.findOne({
            where: {
                title: v.get("body.title"),
                parentId: v.get("body.parentId")
            }
        });
        if (menu) {
            throw new Forbidden({
                code: 10240
            });
        }
        const params=Object.keys(requireModel).concat(optionalModel)
        await sequelize.transaction(async t => {
            const newMenu = new MenuModel();
            params.map(key => {
                newMenu[key] = v.get(`body.${key}`);
            });
            const { id: menu_id } = await newMenu.save({transaction:t});
            if(menumodel.length){
                for (const id of menumodel || []) {
                    const type = await TypeModel.findByPk(id);
                    if (!type) {
                        throw new NotFound({
                            code: 10081
                        });
                    }
                }
                for (const id of menumodel || []) {
                    await MenuTypeModel.create(
                        {
                            model_id: id,
                            menu_id: menu_id
                        },
                        { transaction: t }
                    );
                }
            }
        })
    }
    
    async updateMenu(v) {
        const menu_id = v.get(`body.id`);
        const menumodel=v.get("body.menumodel").split(',').map(Number)
        const menu = await MenuModel.findByPk(menu_id);
        if (!menu) {
            throw new NotFound({
                code: 10022
            });
        }
        await sequelize.transaction(async transaction => {
            optionalModel.map(key => {
                menu[key] = v.get(`body.${key}`);
            });
            await menu.save({transaction});
            if(menumodel.length){
                const menuType = await MenuTypeModel.findAll({where: {menu_id}});
                const menuTypeIds = menuType.map(v => v.model_id);
                const isChangeType=!isEqual(menumodel,menuTypeIds)
                if(isChangeType){
                    for (const id of menumodel || []) {
                        const type = await TypeModel.findByPk(id);
                        if (!type) {
                            throw new NotFound({
                                code: 10079
                            });
                        }
                    }
                    await MenuTypeModel.destroy({
                        where: {
                            menu_id
                        },
                        transaction
                    });
                    for (const id of menumodel || []) {
                        await MenuTypeModel.create(
                            {
                                menu_id: menu_id,
                                model_id: id
                            },
                            {transaction}
                        );
                    }
                }
            }
        })

    }
    
    async deleteMenu(id) {
        const menu = await MenuModel.findByPk(id);
        if (!menu) {
            throw new NotFound({
                code: 10022
            });
        }
        await sequelize.transaction(async transaction => {
            await menu.destroy({transaction});
            if(menu.parentId){
                const menus =await MenuModel.findAll( {where: {
                    parentId: id
                }})
                for (const item of menus || []) {
                    await item.destroy({transaction})
                    await MenuTypeModel.destroy({
                        where: {
                            menu_id: item.id
                        },
                        transaction
                    })
                }
            }
        })
    }
}

export { MenuDao };
