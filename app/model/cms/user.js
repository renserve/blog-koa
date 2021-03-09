import {
    NotFound,
    verify,
    AuthFailed,
    generate,
    Failed,
    config,
    InfoCrudMixin
} from "lin-mizar";
import sequelize from "@lib/db";
import { IdentityType } from "@lib/type";
import { Model, Sequelize } from "sequelize";
import { get, has, merge } from "lodash";
class UserIdentity extends Model {
    checkPassword(raw) {
        if (!this.credential) {
            return false;
        }
        return verify(raw, this.credential);
    }
    
    static async verify(username, password) {
        const user = await this.findOne({
            where: {
                identity_type: IdentityType.Password,
                identifier: username
            }
        });
        if (!user) {
            throw new NotFound({ code: 10021 });
        }
        if (!user.checkPassword(password)) {
            throw new AuthFailed({ code: 10031 });
        }
        return user;
    }
    
    static async changePassword(currentUser, oldPassword, newPassword) {
        const user = await this.findOne({
            where: {
                identity_type: IdentityType.Password,
                identifier: currentUser.username
            }
        });
        if (!user) {
            throw new NotFound({ code: 10021 });
        }
        if (!user.checkPassword(oldPassword)) {
            throw new Failed({
                code: 10011
            });
        }
        user.credential = generate(newPassword);
        await user.save();
    }
    static async resetUsername(currentUser, newUsername,options) {
        const user = await this.findOne({
            where: {
                identity_type: IdentityType.Password,
                identifier: currentUser.username
            }
        });
        if (!user) {
            throw new NotFound({ code: 10021 });
        }
        user.identifier = newUsername;
        await user.save(options);
    }
    static async resetPassword(currentUser, newPassword,options) {
        const user = await this.findOne({
            where: {
                identity_type: IdentityType.Password,
                identifier: currentUser.username
            }
        });
        if (!user) {
            throw new NotFound({ code: 10021 });
        }
        user.credential = generate(newPassword);
        await user.save(options);
    }
}

UserIdentity.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "用户id"
        },
        identity_type: {
            type: Sequelize.STRING(100),
            allowNull: false,
            comment: "登录类型（手机号 邮箱 用户名）或第三方应用名称（微信 微博等）"
        },
        identifier: {
            type: Sequelize.STRING(100),
            comment: "标识（手机号 邮箱 用户名或第三方应用的唯一标识）"
        },
        credential: {
            type: Sequelize.STRING(100),
            comment: "密码凭证（站内的保存密码，站外的不保存或保存token）"
        }
    },
    merge(
        {
            sequelize,
            tableName: "cms_user_identity"
        },
        InfoCrudMixin.options
    )
);

class User extends Model {
    toJSON() {
        const origin = {
            id: this.id,
            username: this.username,
            nickname: this.nickname,
            isLock: this.isLock,
            signature: this.signature,
            email: this.email,
            avatar: this.avatar && (/http/.test(this.avatar)?this.avatar:`${config.getItem("siteDomain", "http://localhost")}/upload/assets/${this.avatar}`) || null
        };
        has(this, "groupIds") && (origin.groupIds=get(this, "groupIds", []))
        has(this, "usermodel") && (origin.usermodel=this.usermodel?this.usermodel.map(i=>i.id):[])
        return origin;
    }
}

User.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        isLock: {
            type: Sequelize.INTEGER(2),
            allowNull: false,
            defaultValue:1,
            comment: "是否受制约"
        },
        username: {
            type: Sequelize.STRING(24),
            allowNull: false,
            comment: "用户名，唯一"
        },
        nickname: {
            type: Sequelize.STRING(24),
            comment: "用户昵称"
        },
        signature: {
            type: Sequelize.STRING(255),
            comment: "个性签名"
        },
        avatar: {
            type: Sequelize.STRING(500),
            comment: "头像url"
        },
        email: {
            type: Sequelize.STRING(100),
            allowNull: true
        }
    },
    merge(
        {
            sequelize,
            tableName: "cms_user"
        },
        InfoCrudMixin.options
    )
);

export { User as UserModel, UserIdentity as UserIdentityModel };
