import {RequiredValidator} from "@validator/cms/common";
import {Rule} from "lin-mizar";

class IdeaValidator extends RequiredValidator {
    constructor (object,array) {
        super(object,array);
        this.name = new Rule("isLength", "字符云长度必须在1~60之间", 1, 60)
    }
}
export {IdeaValidator}