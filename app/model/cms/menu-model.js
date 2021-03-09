import { Model, Sequelize } from "sequelize";
import sequelize from "@lib/db";

class MenuTypeModel extends Model {
}

MenuTypeModel.init(
    {
        model_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "分组id"
        },
        menu_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "菜单id"
        }
    },
    {
        sequelize,
        timestamps: false,
        tableName: "cms_menu_model"
    }
);

export { MenuTypeModel };
