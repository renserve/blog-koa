import { Rule, checkDateFormat } from 'lin-mizar';
import { PaginateValidator } from './common';
import { isOptional } from '@lib/util';

class LogFindValidator extends PaginateValidator {
  constructor () {
    super();
    this.username = new Rule('isOptional');
    this.model = new Rule('isOptional');
  }

  validateStart (data) {
    const startDate = data.query.startDate;
    // 如果 start 为可选
    if (isOptional(startDate)) {
      return true;
    }
    const ok = checkDateFormat(startDate);
    if (ok) {
      return ok;
    } else {
      return [false, '请输入正确格式开始时间', 'startDate'];
    }
  }

  validateEnd (data) {
    if (!data.query) {
      return true;
    }
    const endDate = data.query.endDate;
    if (isOptional(endDate)) {
      return true;
    }
    const ok = checkDateFormat(endDate);
    if (ok) {
      return ok;
    } else {
      return [false, '请输入正确格式结束时间', 'endDate'];
    }
  }
}

export { LogFindValidator };
