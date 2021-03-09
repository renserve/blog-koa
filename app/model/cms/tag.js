import sequelize from '@lib/db';
import { Model, Sequelize } from 'sequelize';
const requireModel={
    'name':"标签名称",'modelId':"模块类型"
}
import { set } from "lodash";
class Tag extends Model {
    toJSON() {
        let origin = {
            id: this.id,
            name: this.name,
            sort: this.sort,
            operateId: this.operateId
        };
        this.categories && set(origin,'categories',this.categories)
        return origin;
    }
}

Tag.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    sort: {
        type: Sequelize.INTEGER(3),
        defaultValue:0
    },
    operateId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    modelId: {
        type: Sequelize.INTEGER(2),
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'cms_tag'
})

module.exports = {
    Tag,requireModel
}
