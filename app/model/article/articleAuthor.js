import sequelize from "@lib/db";
import { Model, Sequelize } from "sequelize";

class ArticleAuthor extends Model {

}

ArticleAuthor.init({
    article_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    author_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    timestamps: false,
    tableName: "article_author"
});

module.exports = {
    ArticleAuthor
};
