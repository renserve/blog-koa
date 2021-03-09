import { Model, Sequelize } from "sequelize";
import sequelize from "@lib/db";

class Group extends Model {
    toJSON() {
        const origin = {
            id: this.id,
            name: this.name,
            info: this.info,
            menuIds:this.menuIds && this.menuIds.split(",").map(Number) || null,
            authIds:this.authIds && this.authIds.split(",").map(Number) || null,
        };
        return origin;
    }
}

Group.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(60),
            allowNull: false,
            comment: "分组名称，例如：搬砖者"
        },
        modelId: {
            type: Sequelize.INTEGER(2),
            allowNull: false
        },
        menuIds: {
            type: Sequelize.STRING(255),
            comment: "分组信息：例如：搬砖的人"
        },
        authIds: {
            type: Sequelize.STRING(800),
            comment: "分组信息：例如：搬砖的人"
        },
        info: {
            type: Sequelize.STRING(255),
            comment: "分组信息：例如：搬砖的人"
        },
        level: {
            type: Sequelize.INTEGER(2),
            defaultValue: 3,
            comment: "分组级别 1：root 2：guest 3：user（root、guest分组只能存在一个)"
        }
    },
    {
        sequelize,
        tableName: "cms_group",
        timestamps: false
    }
);

export { Group as GroupModel };
