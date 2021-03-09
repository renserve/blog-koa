import Sequelize from 'sequelize';
import { LogModel } from "@model/cms/log";
import { set } from "lodash";
const Op=Sequelize.Op;
class LogDao {
    async getLogs(v) {
        const start = v.get("query.page");
        const count1 = v.get("query.count");
        const modelId = v.get("query.modelId");
        const condition = {modelId};
        v.get("query.username") && set(condition, "username", v.get("query.username"));
        v.get("query.startDate") &&
        v.get("query.endDate") &&
        set(condition, "createdAt", {
            [Op.between]: [v.get("query.startDate"), v.get("query.endDate")]
        });
        const { rows, count } = await LogModel.findAndCountAll({
            where: Object.assign({}, condition),
            offset: start * count1,
            limit: count1,
            order: [["createdAt", "DESC"]]
        });
        return {
            rows,
            total: count
        };
    }
    async deleteLogs(ids){
        await LogModel.destroy({
            where: {
                id:{
                    [Op.in]:ids
                }
            }
        });
    }
}

export { LogDao };
