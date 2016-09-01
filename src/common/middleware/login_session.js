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
    return authObj;
  }

  *checkAuth() {
    let http = this.http;
    let url = http.req.url;
    let admin = yield http.session('admin');
    // admin = 1;//测试登录
    if(url.lastIndexOf('/') !== url.length - 1) url += "/";
    if(url.match(/^\/admin\/(([^/]*)?\/?)?(([^/]*)?\/?)*/)) {
      let _2 = RegExp.$2;
      let _4 = RegExp.$4;
      if((_2 === "index" && _4 === 'login')
        || (_2 === "login")) {
        //登录请求
        if(admin) {
          http.redirect("/admin/");
          return http.prevent();
        }
      } else if((_2 === 'index' && _4 === 'index')
        || (_2 === "index" && !_4)
        || (_2 === "index" && _4 !== "login")
        || (!_2 && !_4)) {
        //后台非登录请求
        if(!admin) {
          http.redirect("/admin/login");
          return http.prevent();
        }
      }
    }
    return {};
  }
}