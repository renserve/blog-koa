import sequelize from "@lib/db";
import { Model, Sequelize } from "sequelize";
import { InfoCrudMixin } from 'lin-mizar';
import { set } from "lodash";
const requireModel={
    'name':"名称",
    'link':"链接",
    "modelId":"模块类型"
}
class Friend extends Model {
    toJSON() {
        let origin = {
            id: this.id,
            name: this.name,
            link: this.link,
            avatar: this.avatar
        };
        return origin;
    }
}

Friend.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(64),
            allowNull: false
        },
        operateId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        modelId: {
            type: Sequelize.INTEGER(2),
            allowNull: false
        },
        link: {
            type: Sequelize.STRING(255),
            comment: "链接",
            allowNull: false
        },
        avatar: {
            type: Sequelize.STRING(255),
            comment: "LOGO"
        }
    }, {
        sequelize,
        tableName: "cms_friend"
    }
);

module.exports = {
    Friend,requireModel
};
