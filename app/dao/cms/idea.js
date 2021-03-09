import { Op } from 'sequelize';
const { NotFound ,RepeatException} = require("lin-mizar");
const { IdeaList ,requireModel} = require("@model/cms/idea");
import { set} from "lodash";
class IdeaListDao {
    async createIdeaList(v,ctx) {
        const authorId=ctx.currentUser.id
        const idea = await IdeaList.findOne({
            where: {
                name: v.get("body.name"),
                authorId: authorId,
            }
        });
        if (idea) {
            throw new RepeatException({
                message: "字符重复，请重新添加"
            });
        }
        await IdeaList.create({
            name: v.get("body.name"),
            value: v.get("body.value"),
            status: v.get("body.status"),
            authorId:authorId,
            operateId: authorId,
            modelId: v.get("body.modelId")
        });
    }
    // 修改
    async updateIdeaList(v,ctx) {
        const id=v.get(`body.id`)
        const idea = await IdeaList.findByPk(id);
        if (!idea) {
            throw new NotFound({
                message: "没有找到相关字符"
            });
        }
        Object.keys(requireModel).map(k=>{
            idea[k]!==v.get(`body[${k}]`) && (idea[k]=v.get(`body[${k}]`))
        })
        idea.operateId=ctx.currentUser.id
        await idea.save();
    }
    
    // 获取
    async getIdeaList(v,ctx) {
        const condition={}
        const page = v.get('query.page');
        const count1 = v.get('query.count');
        const authorId = v.get('query.authorId');
        const status=v.get("query.status")
        const modelId=v.get("query.modelId")
        const name=v.get("query.name")
        modelId && set(condition, 'modelId',modelId);
        status && set(condition, 'status',status);
        authorId && set(condition, 'authorId',authorId);
        name && set(condition,'name',{[Op.like]: `%${name}%`})
        const { rows, count } = await IdeaList.findAndCountAll({
            where: Object.assign({}, condition),
            offset: page * count1,
            limit: count1,
            order: [
                ["create_time", "DESC"]
            ]
        });
        return {
            rows,
            total: count
        };
    }
    
    // 删除字符
    async deleteIdeaList(id) {
        const idea = await IdeaList.findByPk(id);
        if (!idea) {
            throw new NotFound({
                message: "没有找到相关字符"
            });
        }
        idea.destroy();
    }
}

export {
    IdeaListDao
};
