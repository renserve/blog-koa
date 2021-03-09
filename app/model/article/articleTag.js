import sequelize from "@lib/db";
import { Model, Sequelize } from "sequelize";

class ArticleTag extends Model {

}

ArticleTag.init({
    article_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    timestamps: false,
    tableName: "article_tag"
});

module.exports = {
    ArticleTag
};
