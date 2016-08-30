'use strict';
/**
 * middleware
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  *run(){
    let authObj = yield this.checkAuth();
    // console.log(authObj)
    // console.log("MiddleWare: ", url, url.match(/^\/admin\/(?!login)/));
    return authObj;
  }

  *checkAuth() {
    let http = this.http;
    let url = http.req.url;
    let admin = yield http.session('admin');
    // admin = 1;
    console.log(">>>", url.match(/^\/admin\/(?!(login|?!image))(.*)$/));
    if(url.match(/^\/admin\/(?!login)(.*)$/)) {
      if(!admin) {
        http.redirect("/admin/login");
        return think.prevent();
      }
    }
    return {};
  }
}