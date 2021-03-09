import sequelize from "@lib/db";
import { Model, Sequelize } from "sequelize";
import { InfoCrudMixin } from 'lin-mizar';
import {merge, set} from "lodash";
class IdeaList extends Model {
    toJSON() {
        let origin = {
            id: this.id,
            name: this.name,
            authorId: this.authorId,
            value: this.value,
            status: this.status,
        }
        return origin;
    }
}
const requireModel={
    "status":"状态",
    'name':"字符",
    'value':"权重",
    'modelId':"模块",
}
IdeaList.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(64),
            allowNull: false
        },
        value: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        authorId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        operateId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        modelId: {
            type: Sequelize.INTEGER(2),
            allowNull: false
        }
    },
    merge(
        {
            sequelize,
            tableName: "idea",

        },
        InfoCrudMixin.options
    )
);

module.exports = {
    IdeaList,requireModel
};
