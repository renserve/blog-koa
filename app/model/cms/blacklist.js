import sequelize from "@lib/db";
import { Model, Sequelize } from "sequelize";
import { InfoCrudMixin } from 'lin-mizar';
import { set } from "lodash";
class Blacklist extends Model {
    toJSON() {
        let origin = {
            id: this.id,
            nickname: this.nickname,
            classId: this.classId,
            operateId: this.operateId,
            email: this.email,
            ip: this.ip,
            area: this.area,
            remark: this.remark,
            avatar: this.avatar,
            update_time:this.updatedAt,
            create_time:this.createdAt
        };
        return origin;
    }
}

Blacklist.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        modelId: {
            type: Sequelize.INTEGER(2),
            allowNull: false
        },
        classId: {
            type: Sequelize.INTEGER
        },
        operateId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        nickname: {
            type: Sequelize.STRING(64),
            allowNull: false
        },
        ip: {
            type: Sequelize.STRING(100)
        },
        area: {
            type: Sequelize.STRING(100)
        },
        email: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        avatar: {
            type: Sequelize.STRING(255)
        },
        remark: {
            type: Sequelize.STRING(255)
        },
    }, {
        sequelize,
        tableName: "cms_blacklist"
    }
);

module.exports = {
    Blacklist
};
