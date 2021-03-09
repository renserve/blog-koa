import { Rule, LinValidator } from "lin-mizar";
import { isOptional } from "@lib/util";
import { model } from "@model/cms/menu";
import { PaginateValidator, PositiveIdValidator,RequiredValidator } from "./common";
import validator from "validator";

class menuValidator extends PaginateValidator {
    constructor() {
        super();
        Object.keys(model).map(key=>{
            if(model[key].validate){
                const rules=model[key].validate.map(k=>{
                    return new Rule(k,`${key}不能为空`)
                })
                this[key]=rules.length>1?rules:rules[0]
            }
        })
    }
}

export {
    menuValidator
};
