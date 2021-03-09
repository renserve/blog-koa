import {RepeatException, generate, NotFound, Forbidden, config} from "lin-mizar";
import { UserIdentityModel } from "@model/cms/user";
import { UserGroupModel } from "@model/cms/user-group";
import { GroupModel } from "@model/cms/group";
import sequelize from "@lib/db";
import {  IdentityType } from "@lib/type";
import { set, has } from "lodash";
import {setFileActive} from '@middleware/file'
const {UserModel ,UserTypeModel} = require("@model/cms");
class UserDao {
    async createUser(v) {
        let user = await UserModel.findOne({
            where: {
                username: v.get("body.username")
            }
        });
        if (user) {
            throw new RepeatException({
                code: 10071
            });
        }
        if (v.get("body.email") && v.get("body.email").trim() !== "") {
            user = await UserModel.findOne({
                where: {
                    email: v.get("body.email")
                }
            });
            if (user) {
                throw new RepeatException({
                    code: 10076
                });
            }
        }
        const groupIds=v.get("body.groupIds") && v.get("body.groupIds").split(',').map(Number) || []
        for (const id of groupIds) {
            const group = await GroupModel.findByPk(id);
            if (!group) {
                throw new NotFound({
                    code: 10023
                });
            }
        }
        await this.registerUser(v);
    }
    
    async updateUser(ctx, v) {
        let user = ctx.currentUser,isChange;
        if (user.email !== v.get("body.email")) {
            if(v.get("body.email")){
                const exit = await UserModel.findOne({
                    where: {
                        email: v.get("body.email")
                    }
                });
                if (exit) {
                    throw new RepeatException({
                        code: 10076
                    });
                }
            }
            isChange=true
            user.email = v.get("body.email");
        }
        if (v.get("body.nickname")!==user.nickname) {
            user.nickname = v.get("body.nickname");
            isChange=true
        }
        if (v.get("body.avatar")!==user.avatar) {
            //更改图片active
            if(v.get("body.avatar")){
                await setFileActive(v.get("body.avatar"))
            }
            isChange=true
            user.avatar = v.get("body.avatar");
        }
        isChange && await user.save();
    }
    
    async getInformation(ctx) {
        const user = ctx.currentUser;
        const userGroup = await UserGroupModel.findAll({
            where: {
                user_id: user.id
            }
        });
        const groupIds = userGroup.map(v => v.group_id);
        set(user, "groupIds", groupIds);
        return user;
    }
    
    async registerUser(v) {
        let transaction;
        try {
            transaction = await sequelize.transaction();
            const user = {
                username: v.get("body.username")
            };
            if (v.get("body.email") && v.get("body.email").trim() !== "") {
                user.email = v.get("body.email");
            }
            user.nickname = v.get("body.nickname");
            user.avatar = v.get("body.avatar");
            user.signature = v.get("body.signature");
            user.isLock = v.get("body.isLock");
            const { id: user_id } = await UserModel.create(user, {
                transaction
            });
            await UserIdentityModel.create(
                {
                    user_id,
                    identity_type: IdentityType.Password,
                    identifier: user.username,
                    credential: generate(v.get("body.password"))
                },
                {
                    transaction
                }
            );

            const usermodel=(v.get("body.usermodel") || '').split(',').map(Number)
            for (const id of usermodel || []) {
                await UserTypeModel.create(
                    {
                        user_id: user_id,
                        model_id: id
                    },
                    { transaction }
                );
            }
            const groupIds = (v.get("body.groupIds") || '').split(',').map(Number);
            for (const id of groupIds || []) {
                await UserGroupModel.create(
                    {
                        user_id,
                        group_id: id
                    },
                    { transaction }
                );
            }
            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
        }
        return true;
    }
    
    formatPermissions(permissions) {
        const map = {};
        permissions.forEach(v => {
            const module = v.module;
            if (has(map, module)) {
                map[module].push({
                    permission: v.name,
                    module
                });
            } else {
                set(map, module, [
                    {
                        permission: v.name,
                        module
                    }
                ]);
            }
        });
        return Object.keys(map).map(k => {
            const tmp = Object.create(null);
            set(tmp, k, map[k]);
            return tmp;
        });
    }
}

export { UserDao };
