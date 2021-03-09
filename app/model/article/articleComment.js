import sequelize from "@lib/db";
import { Model, Sequelize } from "sequelize";

class ArticleComment extends Model {

}

ArticleComment.init({
    article_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    comment_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    timestamps: false,
    tableName: "article_comment"
});

module.exports = {
    ArticleComment
};
