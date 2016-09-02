'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  baseAction(){
    //auto render template file index_index.html
    return this.display();
  }

  *logAction() {
    let syslogs = yield this.model('syslog').list();
    console.log(syslogs);
    this.assign({
      logs: syslogs
    });
    console.log(this.http.url);
    return this.display();
  }

  *dellogAction(_id) {
    let ret = yield this.model("syslog").delLog(_id);
    console.log(ret);
    this.end({errmsg: ret});
  }
  *searchAction(starttime, endtime, key) {
    let options = {};
    if(starttime) options.starttime = starttime;
    if(endtime) options.endtime = endtime;
    if(key) options.key = key;
    var where = {}, or = false;
    ///////下面的可能有错，需要测试
    if(options.starttime && options.endtime) {
      where.optime = [">=", options.starttime, "and", "<=", options.endtime];
      or = true;
    }
    if(options.key) {
      if(or) {
        var optime = where.optime;
        where = {
          $or: [
            {optime: optime},
            {key: options.key}
          ]
        };
      }
    }
    let list = yield this.model("syslog").searchList(where);
    return list;
  }
}