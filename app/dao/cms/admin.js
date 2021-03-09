import { NotFound, Forbidden ,RepeatException} from "lin-mizar";

import {  UserIdentityModel } from "@model/cms/user";
import { GroupModel } from "@model/cms/group";
import { UserGroupModel } from "@model/cms/user-group";
const { UserModel, TypeModel ,UserTypeModel} = require("@model/cms");

import sequelize from "@lib/db";
import { MountType, GroupLevel } from "@lib/type";
import { Op } from "sequelize";
import { has, set, get,isEqual,difference,isUndefined ,uniqBy} from "lodash";
import { PermissionModel } from "../../model/cms/permission";
import {setFileActive} from '@middleware/file'
class AdminDao {
    async getUsers(v,ctx) {
        const condition = {
            distinct: true,
            include: [
                {
                    model: TypeModel,
                    attributes: ["id", "name"],
                    as: "usermodel"
                }
            ]
        };
        const groupId=v.get("query.groupId")
        const page=v.get("query.page")
        const count1=v.get("query.count")
        const model_id=v.get("query.modelId")
        let userIds = [];
        if(!isUndefined(page) && !isUndefined(count1)){
            if(!ctx.currentUser){
                return await UserGroupModel.findAll(condition)
            }
            set(condition, 'offset',page * count1);
            set(condition, 'limit',count1);
            if (groupId) {
                const userGroup = await UserGroupModel.findAll({
                    where: {
                        group_id: groupId
                    }
                });
                userIds = userGroup.map(v => v.user_id);
                set(condition, "where.id", {
                    [Op.in]: userIds
                });
            }
            const { rows, count } = await UserModel.findAndCountAll(condition);
            for (const user of rows) {
                const userGroup = await UserGroupModel.findAll({
                    where: {
                        user_id: user.id
                    }
                })
                set(user, "groupIds", userGroup.map(v => v.group_id));
            }
            return {
                rows,
                total: count
            };
            
        }else {
            const filter={}
            if(model_id){
                const userIds=await UserTypeModel.findAll({where:{model_id}})
                set(filter, 'id',{
                    [Op.in]:userIds.map(i=>i.user_id)
                });
            }
            return (await UserModel.findAll({
                where:filter
            }));
        }
    }
    
    async changeUserPassword(ctx, v)   {
        const user = await UserModel.findByPk(v.get("path.id"));
        if (!user) {
            throw new NotFound({
                code: 10021
            });
        }
        await UserIdentityModel.resetPassword(user, v.get("body.new_password"));
    }
    
    async deleteUser(ctx, id) {
        const user = await UserModel.findByPk(id);
        if (!user) {
            throw new NotFound({
                code: 10021
            });
        }
        if (user.id===ctx.currentUser.id) {
            throw new Forbidden({
                message: '当前用户不可删除'
            });
        }
        await sequelize.transaction(async t => {
            const condition={
                where: {
                    user_id: id
                },
                transaction: t
            }
            await UserGroupModel.destroy(condition);
            await UserTypeModel.destroy(condition);
            await UserIdentityModel.destroy(condition);
            await user.destroy({ transaction: t });
        })
    }
    
    async updateUserInfo(ctx, v) {
        const user_id=v.get("body.id")
        const user = await UserModel.findByPk(user_id);
        const groupIds=(v.get("body.groupIds") || '').split(',').map(Number)
        const usermodel=(v.get("body.usermodel") || '').split(',').map(Number)
        if (!user) {
            throw new NotFound({
                code: 10021
            });
        }
        const username=v.get("body.username")
        const password=v.get("body.password")
        //基本信息修改
        if( username && user.username !== username){
            const existUser = await UserModel.findOne({
                where: {
                    username: v.get("body.username")
                }
            });
            if (existUser) {
                throw new RepeatException({
                    code: 10071
                });
            }
        }
        //事务开始
        await sequelize.transaction(async t => {
            username!==user.username && await UserIdentityModel.resetUsername(user, username,{ transaction: t })
            password && await UserIdentityModel.resetPassword(user, password,{ transaction: t })
            let isChange;
            if(user['avatar']!==v.get(`body.avatar`)){
                await setFileActive(v.get(`body.avatar`))
            }
            ['username','nickname','email','avatar','signature','isLock'].map(key=>{
                if(user[key]!==v.get(`body.${key}`)){
                    user[key]=v.get(`body.${key}`)
                    isChange=true
                }
            })
            isChange && await user.save({ transaction: t })
            //模块信息修改
            if(usermodel.length){
                const userType = await UserTypeModel.findAll({where: {user_id}});
                const userTypeIds = userType.map(v => v.model_id);
                const isChangeType=!isEqual(usermodel,userTypeIds)
                if(isChangeType){
                    for (const id of usermodel || []) {
                        const type = await TypeModel.findByPk(id);
                        if (!type) {
                            throw new NotFound({
                                code: 10079
                            });
                        }
                    }
                    await UserTypeModel.destroy({
                        where: {
                            user_id: user_id
                        },
                        transaction: t
                    });
                    for (const id of usermodel || []) {
                        await UserTypeModel.create(
                            {
                                user_id: user_id,
                                model_id: id
                            },
                            { transaction: t }
                        );
                    }
                }
            }
            //分组信息修改
            if(groupIds.length){
                const userGroup = await UserGroupModel.findAll({where: {user_id}});
                const userGroupIds = userGroup.map(v => v.group_id);
                const isChangeGroup=!isEqual(groupIds,userGroupIds)
                if(isChangeGroup){
                    for (const id of groupIds || []) {
                        const group = await GroupModel.findByPk(id);
                        if (!group) {
                            throw new NotFound({
                                code: 10077
                            });
                        }
                    }
                    await UserGroupModel.destroy({
                        where: {
                            user_id: user_id
                        },
                        transaction: t
                    });
                    for (const id of groupIds || []) {
                        await UserGroupModel.create(
                            {
                                user_id: user_id,
                                group_id: id
                            },
                            { transaction: t }
                        );
                    }
                }
            }
        });
    }
    
    async getGroups(v) {
        const page = v.get('query.page');
        const count1 = v.get('query.count');
        const modelId=v.get("query.modelId")
        const condition={
            where:{modelId},
        }
        if(!isUndefined(page) && !isUndefined(count1)){
            const { rows, count } = await GroupModel.findAndCountAll({
                condition,
                offset: page * count1,
                limit: count1
            });
            return {
                rows,
                total: count
            };
        }else {
            return await GroupModel.findAll(condition);
        }
    }
    
    async getGroup(ctx, id) {
        const group = await GroupModel.findByPk(id);
        if (!group) {
            throw new NotFound({
                code: 10024
            });
        }
        return group
    }
    async getButton(){
        const permissionButtons =  await PermissionModel.findAll({
            where: {
                mount: MountType.Mount
            }
        });
        const result = Object.create(null);
        permissionButtons.forEach(v => {
            const item = {
                id: get(v, 'id'),
                name: get(v, 'name'),
                module: get(v, 'module')
            };
            if (has(result, item.module)) {
                const index=result[item.module].findIndex(i=>i.name===item.name)
                index<0 && result[item.module].push(item);
            } else {
                set(result, item.module, [item]);
            }
        });
        return result;
    }
    async createGroup(ctx, v) {
        const group = await GroupModel.findOne({
            where: {
                [Op.and]:[
                    {name: v.get("body.name")},
                    {modelId: v.get("body.modelId")}
                ]
            }
        });
        if (group) {
            throw new Forbidden({
                code: 10072
            });
        }
        await GroupModel.create({
            name: v.get("body.name"),
            info: v.get("body.info"),
            modelId: v.get("body.modelId")
        });
        return true;
    }
    
    async updateGroup(ctx, v) {
        const group = await GroupModel.findByPk(v.get("body.id"));
        if (!group) {
            throw new NotFound({
                code: 10024
            });
        }
        group.name = v.get("body.name")
        group.info = v.get("body.info")
        group.modelId = v.get("body.modelId")
        await group.save();
    }
    
    async deleteGroup(ctx, id) {
        const group = await GroupModel.findByPk(id);
        if (!group) {
            throw new NotFound({
                code: 10024
            });
        }
        if (group.level === GroupLevel.Root) {
            throw new Forbidden({
                code: 10074
            });
        }
        let transaction;
        try {
            transaction = await sequelize.transaction();
            await group.destroy();
            await UserGroupModel.destroy({
                where: {
                    group_id: group.id
                },
                transaction
            });
            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
        }
    }
    
    async dispatchPermissions(ctx, v) {
        const group = await GroupModel.findByPk(v.get("body.id"));
        if (!group) {
            throw new NotFound({
                code: 10024
            });
        }
        group.menuIds=v.get("body.menuIds")
        group.authIds=v.get("body.authIds")
        await group.save()
    }
    
}

export { AdminDao };
