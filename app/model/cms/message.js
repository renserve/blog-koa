import sequelize from '@lib/db'
import { Model, Sequelize } from 'sequelize';
import { InfoCrudMixin } from 'lin-mizar';
const requireModel={
    'nickname':"昵称",'content':"留言内容",'email':"邮箱"
}
import { merge ,set} from 'lodash';
import {formatTime} from '@lib/util'
class Message extends Model {
    toJSON() {
        let origin = {
            id: this.id,
            nickname: this.nickname,
            avatar: this.avatar,
            email: this.email,
            ip: this.ip,
            area: this.area,
            content: this.content,
            operateId: this.operateId,
            reply: this.reply,
            create_time: formatTime(this.createdAt),
            update_time: formatTime(this.updatedAt),
        }
        return origin
    }
}

Message.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    avatar: {
        type: Sequelize.STRING(255),
        comment: "头像"
    },
    ip: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    area: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    operateId: {
        type: Sequelize.INTEGER
    },
    modelId: {
        type: Sequelize.INTEGER(2),
        allowNull: false
    },
    reply: {
        type: Sequelize.STRING(1024),
        comment: "回复",
    },
    nickname: {
        type: Sequelize.STRING(32),
        comment: "昵称"
    },
    content: {
        type: Sequelize.STRING(1024),
        allowNull: false
    }
},
    {
        sequelize,
        tableName: 'cms_message'
    }
)

module.exports = {
    Message,requireModel
}
