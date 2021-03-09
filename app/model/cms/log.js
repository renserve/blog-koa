import { Model, Sequelize } from "sequelize";
import { InfoCrudMixin } from "lin-mizar";
import sequelize from "@lib/db";
import { merge } from "lodash";
import { formatTime } from "@lib/util";

class Log extends Model {
    toJSON() {
        const origin = {
            id: this.id,
            message: this.message,
            create_time: formatTime(this.createdAt),
            user_id: this.user_id,
            username: this.username,
            status_code: this.status_code,
            method: this.method,
            path: this.path,
            content: this.content,
            permission: this.permission
        };
        return origin;
    }
    
    static async createLog(args, commit) {
        const log = Log.build(args);
        commit && await log.save();
        return log;
    }
}

Log.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        modelId: {
            type: Sequelize.INTEGER(2),
            comment: "模块"
        },
        content: {
            type: Sequelize.TEXT
        },
        message: {
            type: Sequelize.STRING(450)
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING(20)
        },
        status_code: {
            type: Sequelize.INTEGER
        },
        method: {
            type: Sequelize.STRING(20)
        },
        path: {
            type: Sequelize.STRING(50)
        },
        permission: {
            type: Sequelize.STRING(100)
        }
    },
    {
        sequelize,
        tableName: "cms_log"
    }
);

export { Log as LogModel };
