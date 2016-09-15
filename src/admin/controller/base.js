'use strict';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  getErrorPage(code) {
    return "../common/error/" + code;
  }

  back() {
    return '<script>location.href=' + this.referer() + '</script>';
  }

  backLog(msg, detail=null, url=null, timeout=3, code=1001) {
    this.assign({
      msg: msg,
      detail: detail||msg,
      backLink: url || this.referer(),
      timeout: timeout
    });
    return this.display(this.getErrorPage(code));
  }
}