import { Rule, LinValidator } from "lin-mizar";
import { isOptional } from "@lib/util";
import { PaginateValidator, PositiveIdValidator } from "./common";
import validator from "validator";

class AdminUsersValidator extends PaginateValidator {
    constructor() {
        super();
        this.group_id = [
            new Rule("isOptional"),
            new Rule("isInt", "分组id必须为正整数", { min: 1 })
        ];
    }
}

class ResetPasswordValidator extends PositiveIdValidator {
    constructor() {
        super();
        this.new_password = new Rule(
            "matches",
            "密码长度必须在6~22位之间，包含字符、数字和 _ ",
            /^[A-Za-z0-9_*&$#@]{6,22}$/
        );
    }
}

class UpdateUserInfoValidator extends PositiveIdValidator {
    constructor() {
        super();
        this.usermodel = new Rule("isNotEmpty", "用户类型不可为空");
        this.groupIds= new Rule("isNotEmpty", "用户分组不可为空");
        this.username = [
            new Rule("isNotEmpty", "用户名不可为空"),
            new Rule("isLength", "用户名长度必须在2~20之间", 2, 20)
        ];
        this.avatar=[
            new Rule("isOptional")
        ]
        this.email = [
            new Rule("isOptional"),
            new Rule("isEmail", "电子邮箱不符合规范，请输入正确的邮箱")
        ];
    }
    
    validateGroupIds(data) {
        const ids = data.body.groupIds && data.body.groupIds.split(",").map(Number) || [];
        if (isOptional(ids)) {
            return true;
        }
        if (!Array.isArray(ids)) {
            return [false, "每个id值必须为正整数"];
        }
        for (let id of ids) {
            if (typeof id === "number") {
                id = String(id);
            }
            if (!validator.isInt(id, { min: 1 })) {
                return [false, "每个id值必须为正整数"];
            }
        }
        return true;
    }
}

class UpdateGroupValidator extends PositiveIdValidator {
    constructor() {
        super();
        this.name = new Rule("isNotEmpty", "请输入分组名称");
        this.modelId = new Rule("isNotEmpty", "请输入模块名称");
        this.info = new Rule("isOptional");
    }
}
class CreateGroupValidator extends  LinValidator{
    constructor() {
        super();
        this.name = new Rule("isNotEmpty", "请输入分组名称");
        this.modelId = new Rule("isNotEmpty", "请输入模块名称");
        this.info = new Rule("isOptional");
    }
}

class RemovePermissionsValidator extends LinValidator {
    constructor() {
        super();
        this.group_id = new Rule("isInt", "分组id必须正整数");
    }
    
    validatePermissionIds(data) {
        const ids = data.body.permission_ids;
        if (!ids) {
            return [false, "请输入permission_ids字段"];
        }
        if (!Array.isArray(ids)) {
            return [false, "每个id值必须为正整数"];
        }
        for (let id of ids) {
            if (typeof id === "number") {
                id = String(id);
            }
            if (!validator.isInt(id, { min: 1 })) {
                return [false, "每个id值必须为正整数"];
            }
        }
        return true;
    }
}

class DispatchPermissionsValidator extends LinValidator {
    constructor() {
        super();
        this.menuIds=new Rule('isOptional','',null)
        this.authIds=new Rule('isOptional','',null)
        this.id = new Rule("isInt", "分组id必须正整数");
    }
}

class DispatchPermissionValidator extends LinValidator {
    constructor() {
        super();
        this.group_id = new Rule("isInt", "分组id必须正整数");
        this.permission_id = new Rule("isNotEmpty", "请输入permission_id字段");
    }
}

export {
    AdminUsersValidator,
    ResetPasswordValidator,
    UpdateGroupValidator,
    CreateGroupValidator,
    UpdateUserInfoValidator,
    DispatchPermissionValidator,
    DispatchPermissionsValidator,
    RemovePermissionsValidator
};
