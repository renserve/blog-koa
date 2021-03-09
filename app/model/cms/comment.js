import sequelize from "@lib/db";
import { Model, Sequelize } from "sequelize";

const requireModel = {
    "parentId":"父级ID", "nickname":"昵称", "modelId":"模块ID","classId":"分类ID","content":"内容", "email":"邮箱"
};
import { set } from "lodash";
class Comment extends Model {
    toJSON() {
        let origin = {
            id: this.id,
            parentId: this.parentId,
            email: this.email,
            ip: this.ip,
            area: this.area,
            nickname: this.nickname,
            avatar: this.avatar,
            content: this.content,
            isReward: this.isReward,
            reply: this.reply,
            like: this.like,
            classId: this.classId
        };
        this.updatedAt && set(origin,'update_time',this.updatedAt)
        this.createdAt && set(origin,'create_time',this.createdAt)
        this.children && set(origin,'children',this.children)
        return origin;
    }
}

Comment.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        parentId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        isReward: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        ip: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        area: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        email: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        nickname: {
            type: Sequelize.STRING(32),
            allowNull: false
        },
        modelId: {
            type: Sequelize.INTEGER(2),
            allowNull: false
        },
        avatar: {
            type: Sequelize.STRING(255)
        },
        reply: {
            type: Sequelize.STRING(1024),
            comment: "回复"
        },
        content: {
            type: Sequelize.STRING(1024),
            allowNull: false
        },
        like: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        classId: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        indexes: [
            {
                name:'modelId_classId_email',
                fields: ["modelId","classId","email"]
            }
        ],
        tableName: "cms_comment"
    }
);

module.exports = {
    Comment, requireModel
};
