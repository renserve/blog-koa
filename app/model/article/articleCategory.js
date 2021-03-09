import sequelize from "@lib/db";
import { Model, Sequelize } from "sequelize";

class ArticleCategory extends Model {

}

ArticleCategory.init({
    article_id: {
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
    tableName: "article_category"
});

module.exports = {
    ArticleCategory
};
