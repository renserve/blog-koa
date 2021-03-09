import {LinValidator, Rule, config} from 'lin-mizar';
import { isOptional } from '@lib/util';
import { isString,isArray,isUndefined} from "lodash";
class PositiveIdValidator extends LinValidator {
  constructor () {
    super();
    this.id = new Rule('isInt', 'id必须为正整数', { min: 1 });
  }
}
class IsEmail extends LinValidator {
    constructor() {
        super();
        this.email = new Rule("isEmail", "电子邮箱不符合规范，请输入正确的邮箱")
    }
}
class IsOptionalValidator extends LinValidator {
    constructor () {
        super();
    }
}
class RequiredValidator extends LinValidator {
    constructor (object,array) {
        super();
        Object.keys(object).map(key=>{
            this[key]=new Rule('isNotEmpty',`${object[key]}不能为空`)
        })
        array && array.map((key,index)=>{
            if(isString(key)){
                this[key]=new Rule('isOptional','',null)
            }else if(isArray(key)){
                let k=key[0]
                let rule=key[1]
                let min=key[2]
                if(isString(rule)){
                    switch (rule){
                        case 'isInt':
                            this[k]=new Rule('isInt', `${k}必须为整数`, min && { min })
                            break
                        default:
                            break
                    }
                }
            }
        })
    }
}
class PaginateValidator extends LinValidator {
  constructor () {
    super();
    this.count = [
      new Rule('isOptional', '', config.getItem('countDefault')),
      new Rule('isInt', 'count必须为正整数', { min: 1 })
    ];
    this.page = [
      new Rule('isOptional', '', config.getItem('pageDefault')),
      new Rule('isInt', 'page必须为整数，且大于等于0', { min: 0 })
    ];
  }
}

export { PaginateValidator, PositiveIdValidator ,RequiredValidator,IsOptionalValidator,IsEmail};
