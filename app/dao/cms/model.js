import { NotFound, Forbidden } from 'lin-mizar';
import Sequelize from 'sequelize';
import { TypeModel,requireModel } from '@model/cms/model';
import { MountType, GroupLevel } from "@lib/type";
const Op=Sequelize.Op
import { set, get,isUndefined } from "lodash";
class TypeModelDao {
    async getModel (v) {
        const page=v.get("query.page")
        const count1=v.get("query.count")
        if(!isUndefined(page) && !isUndefined(count1)){
            const { rows, count }  = await TypeModel.findAndCountAll({
                offset: page * count1,
                limit: count1
            });
            return {
                rows,
                total: count
            };
        }else {
            return await TypeModel.findAll();
        }
    }
    async createModel  (v) {
        const typeModel = await TypeModel.findOne({
            where: {
                name: v.get('body.name')
            }
        });
        if (typeModel) {
            throw new Forbidden({
                message:'已存在该用户模块'
            });
        }
        const newTypeModel = new TypeModel();
        Object.keys(requireModel).map(key=>{
            newTypeModel[key]=v.get(`body.${key}`)
        })
        await newTypeModel.save();
    }
    
    async updateModel (v) {
        const id=v.get(`body.id`)
        const typeModel = await TypeModel.findByPk(id);
        if (!typeModel) {
            throw new NotFound({
                message:'未找到该用户模块'
            });
        }
        let isChange;
        Object.keys(requireModel).map(key=>{
            if(typeModel[key]!==v.get(`body.${key}`)){
                typeModel[key]=v.get(`body.${key}`)
                isChange=true
            }

        })
        isChange && await typeModel.save();
    }
    
    async deleteModel (id) {
        const typeModel = await TypeModel.findByPk(id);
        if (!typeModel) {
            throw new NotFound({
                message:'未找到该用户模块'
            });
        }
        if(typeModel.level===GroupLevel.Root){
            throw new Forbidden({
                message:'已锁定禁止操作'
            });
        }
        await typeModel.destroy();
    }
}

export { TypeModelDao };
