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
}