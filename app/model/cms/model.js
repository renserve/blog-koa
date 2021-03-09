import sequelize from '@lib/db';
import { Model, Sequelize } from 'sequelize';
const requireModel={
    'name':"模块名称",
    'model':"模块类型",
}
class UserType extends Model {
    toJSON() {
        let origin = {
            id: this.id,
            name: this.name,
            description: this.description,
            level: this.level,
            model: this.model,
        };
        return origin;
    }
}

UserType.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    level: {
        type: Sequelize.INTEGER(2),
        allowNull: false,
        comment: '模块级别 1：root 2：guest',
        defaultValue:2
    },
    name: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(255),
        comment: '描述',
    },
    model: {
        type: Sequelize.STRING(64),
        allowNull: false
    }
}, {
    sequelize,
    timestamps: false,
    tableName: "cms_model"
});

export  {
    UserType as TypeModel,requireModel
};
