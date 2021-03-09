import sequelize from "@lib/db";
import {Model, Sequelize} from 'sequelize';

const requireModel = {
    'content': "内容",
    'public': "状态",
    'modelId':'模块类型'
}
import {formatTime} from '@lib/util'
import {merge, set,compact} from 'lodash'
import {InfoCrudMixin} from "lin-mizar";

class Mood extends Model {
    toJSON() {
        let origin = {
            "id": this.id,
            "authorId": this.authorId,
            "content": this.content,
            "operateId": this.operateId,
            "categoryId": this.categoryId,
            "cover": this.cover,
            "public": this.public,
            "create_time": formatTime(this.create_data)
        }
        set(origin,'tagId',compact([this.tagId0,this.tagId1,this.tagId2]))
        return origin
    }
}

Mood.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        modelId: {
            type: Sequelize.INTEGER(2),
            allowNull: false
        },
        cover: {
            type: Sequelize.STRING(255)
        },
        authorId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        categoryId: {
            type: Sequelize.INTEGER
        },
        tagId0: {
            type: Sequelize.INTEGER
        },
        tagId1: {
            type: Sequelize.INTEGER
        },
        tagId2: {
            type: Sequelize.INTEGER
        },
        operateId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        public: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        create_data: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
    },
    merge(
        {
            sequelize,
            tableName: 'mood'
        },
        InfoCrudMixin.options
    )
)

module.exports = {
    Mood, requireModel
}
