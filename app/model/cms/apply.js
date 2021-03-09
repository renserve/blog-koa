import sequelize from '@lib/db'
import { Model, Sequelize } from 'sequelize';
const requireModel={
    'nickname':"昵称",'content':"留言内容",'email':"邮箱","modelId":"模块类型"
}
import {
    InfoCrudMixin
} from "lin-mizar";
import { merge ,set} from 'lodash';
import {formatTime} from '@lib/util'
class Apply extends Model {
    toJSON() {
        let origin = {
            id: this.id,
            nickname: this.nickname,
            avatar: this.avatar,
            email: this.email,
            ip: this.ip,
            area: this.area,
            content: this.content,
            reply: this.reply,
            operateId: this.operateId,
            create_time: formatTime(this.create_time),
            update_time: formatTime(this.update_time),
        }
        return origin
    }
}

Apply.init({
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
    modelId: {
        type: Sequelize.INTEGER(2),
        allowNull: false
    },
    operateId: {
        type: Sequelize.INTEGER
    },
    reply: {
        type: Sequelize.STRING(1024),
        defaultValue:"入驻申请中",
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
    merge(
        {
            sequelize,
            tableName: 'cms_apply'
        },
        InfoCrudMixin.options
    )
)

module.exports = {
    Apply,requireModel
}
