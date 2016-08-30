'use strict';

import Base from './base.js';
import ccap from "ccap-dev";
import util from "../utils/common.util";

var captcha = ccap({
  width: 105,
  height: 41,
  offset: 25,
  quality: 100,
  fontSize: 30,
  generate: function() {
    return util.getValidateCode();
  }
});

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file index_index.html
    return this.display();
  }

  welcomeAction() {
    return this.display();
  }

  *loginAction() {
    //如果已经登录，就进入后台页面
    let admin = yield this.session("admin");
    if(admin) return this.redirect("/admin/");
    if(this.isPost()) {
      let svcode = yield this.session("vcode");
      let data = this.post();
      if(!data.username || !data.password) return this.fail(1000, "用户名或密码错误!!");
      let vcode = yield this.session("vcode");
      if(!data.code || data.code.toLowerCase() != vcode.code) return this.fail(1001, "验证码错误!!");
      let user = yield this.model("user").findByUserName(data.username);
      if(!think.isEmpty(user) && think.md5(data.password) === user.password) {
        yield this.session("admin", user);
        return this.redirect("index");
      }
      return this.fail(1002, "用户不存在!!");
    }
    return this.display();
  }

  *imageAction() {
    this.header("content-type","image/png");
    let vcodetime = yield this.session("getvcodetime");
    if(!vcodetime) {
      yield this.session("getvcodetime", Date.now());
    } else {
      let last_get_vcode_time = yield this.session("getvcodetime");
      let gap = Date.now() - last_get_vcode_time;
      if(gap <= 1 * 1000) { //1s
        let sessionData = yield this.session("vcode");
        if(sessionData) {
          this.write(new Buffer(sessionData.hex, "hex"));
          return this.end();
        }
      }
    }
    let ary = captcha.get();
    this.session("getvcodetime", Date.now());
    let sessionData = {
      code: ary[0].toLowerCase(),
      hex: ary[1].toString("hex")
    };
    yield this.session("vcode", sessionData);
    this.write(ary[1]);
    this.end();
  }

}