const { UserModel } = require('@model/cms/user')
const { TypeModel } = require('@model/cms/model')
const { UserTypeModel } = require('@model/cms/user-model')
const { MenuModel } = require('@model/cms/menu')
const { MenuTypeModel } = require('@model/cms/menu-model')
// 关联分类
UserModel.belongsToMany(TypeModel, {
    through: {
        model: UserTypeModel,
        unique: false
    },
    as: 'usermodel',
    foreignKey: 'user_id',
    constraints: false,
})
TypeModel.belongsToMany(UserModel, {
    through: {
        model: UserTypeModel,
        unique: false
    },
    foreignKey: 'model_id',
    constraints: false
})
// 关联菜单
MenuModel.belongsToMany(TypeModel, {
    through: {
        model: MenuTypeModel,
        unique: false
    },
    as: 'menumodel',
    foreignKey: 'menu_id',
    constraints: false,
})
TypeModel.belongsToMany(MenuModel, {
    through: {
        model: MenuTypeModel,
        unique: false
    },
    foreignKey: 'model_id',
    constraints: false
})
module.exports = {
    UserModel,
    TypeModel,
    UserTypeModel,
    MenuModel,
    MenuTypeModel
}