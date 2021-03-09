import { LinValidator, Rule } from "lin-mizar";


class CreateOrUpdateFriendValidator extends LinValidator {
    constructor() {
        super();
        this.name = new Rule("isLength", "友链必须在1~64个字符之间", {
            min: 1,
            max: 64
        })
        this.modelId =   new Rule("isNotEmpty", "模块类型不能为空")
    }
}

module.exports = {
    CreateOrUpdateFriendValidator
};
