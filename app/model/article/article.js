import sequelize from "@lib/db";
import { Model, Sequelize } from 'sequelize';
const requireModel={
    'title':"标题",'articleType':"文章类型",
    'content':"内容",
    "modelId":"模块类型",
    'description':"描述",
    'authorId':"作者",
    'tagId':"标签",
    'categoryId':"分类",
    'public':"状态",
    'star':"精选状态"
}
import {formatTime} from '@lib/util'
import {merge, set} from 'lodash'
import {InfoCrudMixin} from "lin-mizar";
class Article extends Model {
    toJSON() {
        let origin = {
            "id": this.id,
            "title": this.title,
            "content": this.content,
            "articleType": this.articleType,
            "cover":this.cover,
            "bgCover":this.bgCover,
            "description": this.description,
            "username": this.username,
            "public": this.public,
            "star": this.star,
            "collect": this.collect,
            "like":this.like,
            "reward": this.reward,
            "operateId":this.operateId,
            "comment": this.comment,
            "views":this.views,
            "create_time": formatTime(this.create_data)
        }
        this.authorId && set(origin,'authorId',this.authorId.split(",").map(Number))
        this.categoryId && set(origin,'categoryId',this.categoryId.split(",").map(Number))
        this.tagId && set(origin,'tagId',this.tagId.split(",").map(Number))
        this.authors && set(origin,'authors',this.authors)
        this.tags && set(origin,'tags',this.tags)
        this.comments && set(origin,'comments',this.comments)
        this.categories && set(origin,'categories',this.categories)
        this.total && set(origin,'total',this.total)
        return origin
    }
}

Article.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    cover: {
        type: Sequelize.STRING(255)
    },
    bgCover: {
        type: Sequelize.STRING(255)
    },
    description: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    username: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    authorId: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    modelId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    operateId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    categoryId: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    tagId: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    articleType: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue:0
    },
    public: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    collect:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    create_data: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    like: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    reward: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    comment: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    star: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
},
    merge(
        {
            sequelize,
            tableName: 'article'
        },
        InfoCrudMixin.options
    )
)

module.exports = {
    Article,requireModel
}
