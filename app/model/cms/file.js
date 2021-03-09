import { Model, Sequelize } from "sequelize";
import { merge } from "lodash";
import sequelize from "@lib/db";

class File extends Model {
    static async createRecord(args, commit) {
        const record = File.build(args);
        commit && (await record.save());
        return record;
    }
}

File.init(
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
        path: {
            type: Sequelize.STRING(500),
            allowNull: false
        },
        type: {
            type: Sequelize.STRING(10),
            allowNull: false,
            defaultValue: "LOCAL",
            comment: "LOCAL 本地，REMOTE 远程"
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        extension: {
            type: Sequelize.STRING(50)
        },
        size: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        // 建立索引，方便搜索
        // 域名配置
        md5: {
            type: Sequelize.STRING(40),
            allowNull: false,
            comment: "图片md5值，防止上传重复图片"
        },
        active: {
            type: Sequelize.INTEGER(2),
            comment: "是否使用",
            defaultValue: 0,
        },
    },
    merge(
        {
            sequelize,
            tableName: "cms_file",
            timestamps: false
        }
    )
);

export { File as FileModel };
