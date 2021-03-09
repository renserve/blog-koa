import sequelize from "@lib/db";
import { Model, Sequelize } from "sequelize";

const requireModel = {"name":'分类名',"modelId":'模块类型'};
const optionalModel = ["description","operateId","cover","bgCover"];

import {set} from 'lodash'
class Category extends Model {
    toJSON() {
        let origin = {
            id: this.id,
            name: this.name,
            description: this.description,
            operateId: this.operateId,
            cover: this.cover,
            bgCover: this.bgCover
        };
        this.tags && set(origin,'tags',this.tags)
        return origin;
    }
}

Category.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(255),
        comment: "描述"
    },
    modelId: {
        type: Sequelize.INTEGER(2),
        allowNull: false
    },
    operateId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cover: {
        type: Sequelize.STRING(255),
        comment: "封面"
    },
    bgCover: {
        type: Sequelize.STRING(255),
        comment: "背景图"
    },
}, {
    sequelize,
    tableName: "cms_category"
});

module.exports = {
    Category,requireModel,optionalModel
};
