import {RequiredValidator} from './common'
import { LinValidator, Rule, config } from 'lin-mizar';
import { isOptional } from '@lib/util';
class CommentCreateValidator extends RequiredValidator {
    constructor (object,array) {
        super(object,array);
        this.parentId = [
            new Rule('isInt','parentId必须为整数', { min: 0 }),
            new Rule('isOptional','',0)
        ]
        this.email = new Rule("isEmail", "电子邮箱不符合规范，请输入正确的邮箱")
    }
}
export {CommentCreateValidator}
