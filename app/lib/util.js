import { toSafeInteger, get, isInteger } from 'lodash';
import { ParametersException } from 'lin-mizar';

function getSafeParamId (ctx) {
  const id = toSafeInteger(get(ctx.params, 'id'));
  if (!isInteger(id)) {
    throw new ParametersException({
      code: 10030
    });
  }
  return id;
}

const formatTime=function(timestamp){ //传入时间戳，不传默认为今日
    const date = new Date(timestamp) || new Date();
    let Y = date.getFullYear(),
        M = date.getMonth()+1,
        d = date.getDate(),
        H = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
    M<10 && (M = '0'+M)
    d<10 && (d = '0'+d)
    H<10 && (H = '0'+H)
    m<10 && (m = '0'+m)
    s<10 && (s = '0'+s)
    return Y+'-'+M+'-'+d+' '+H+':'+m+':'+s;
}


function isOptional (val) {
  // undefined , null , ""  , "    ", 皆通过
  if (val === undefined) {
    return true;
  }
  if (val === null) {
    return true;
  }
  if (typeof val === 'string') {
    return val === '' || val.trim() === '';
  }
  return false;
}

export { getSafeParamId, isOptional,formatTime };
