const { Article } = require('@model/article/article')
const { ArticleAuthor } = require('@model/article/articleAuthor')
const { ArticleTag } = require('@model/article/articleTag')
const { ArticleCategory } = require('@model/article/articleCategory')
const { CategoryTag } = require('@model/article/categoryTag')
const { ArticleComment } = require('@model/article/articleComment')
const { UserModel  } = require('@model/cms/user')
const { Category } = require('@model/cms/category')
const { Comment } = require('@model/cms/comment')
const { Tag } = require('@model/cms/tag')
//关联用户模块



Comment.hasMany(Comment, {
    as:'children',
    foreignKey:'parentId',
    constraints: false
})

// 关联评论
Article.hasMany(Comment,{
    as: 'comments',
    foreignKey:'classId',
    constraints: false,
})
// 关联分类
Tag.belongsToMany(Category, {
    through: {
        model: CategoryTag,
        unique: false
    },
    as: 'categories',
    foreignKey: 'tag_id',
    constraints: false,
})
Category.belongsToMany(Tag, {
    through: {
        model: CategoryTag,
        unique: false
    },
    as: 'tags',
    foreignKey: 'category_id',
    constraints: false
})
// 关联文章和分类
Article.belongsToMany(Category, {
    through: {
        model: ArticleCategory,
        unique: false
    },
    foreignKey: 'article_id',
    constraints: false,
    as: 'categories'
})
Category.belongsToMany(Article, {
    through: {
        model: ArticleCategory,
        unique: false
    },
    foreignKey: 'category_id',
    constraints: false
})
// 关联文章和作者
Article.belongsToMany(UserModel, {
    through: {
        model: ArticleAuthor,
        unique: false
    },
    foreignKey: 'article_id',
    constraints: false,
    as: 'authors'
})

UserModel.belongsToMany(Article, {
    through: {
        model: ArticleAuthor,
        unique: false
    },
    foreignKey: 'author_id',
    constraints: false
})

// 关联文章和标签
Article.belongsToMany(Tag, {
    through: {
        model: ArticleTag,
        unique: false
    },
    foreignKey: 'article_id',
    constraints: false,
    as: 'tags'
})

Tag.belongsToMany(Article, {
    through: {
        model: ArticleTag,
        unique: false
    },
    foreignKey: 'tag_id',
    constraints: false
})

module.exports = {
    Article,
    ArticleAuthor,
    ArticleComment,
    ArticleCategory,
    ArticleTag,
    UserModel,
    CategoryTag,
    Category,
    Comment,
    Tag
}
