import { Model, Sequelize } from "sequelize";
import sequelize from "@lib/db";

class UserTypeModel extends Model {
}

UserTypeModel.init(
    {
        model_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "分组id"
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "用户id"
        }
    },
    {
        sequelize,
        timestamps: false,
        tableName: "cms_user_model"
    }
);

export { UserTypeModel };
