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
}