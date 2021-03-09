import sequelize from "@lib/db";
import { Model, Sequelize } from "sequelize";

class CategoryTag extends Model {

}

CategoryTag.init({
    tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    category_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    timestamps: false,
    tableName: "category_tag"
});

module.exports = {
    CategoryTag
};
