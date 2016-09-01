'use strict';
import os from "os";
import ccap from "ccap-dev";
import moment from "moment";

import Base from './base.js';
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
  *indexAction(){
    //auto render template file index_index.html
    let admin = yield this.session("admin");
    console.log(admin);
    this.assign({
      admin: admin
    });
    return this.display();
  }

  *welcomeAction() {
    let uptime = os.uptime();
    let uptimeStr = parseInt(uptime / 3600) + "时";
    uptime %= 3600;
    uptimeStr += parseInt(uptime / 60) + "分";
    uptime %= 60;
    uptimeStr += parseInt(uptime) + "秒 ";
    uptime = parseInt(uptime / 60 * 1000);
    uptimeStr += uptime + "ms";
    let port = this.http.host.replace(this.http.hostname + ":", "");
    let cpus = os.cpus();
    this.assign("options", {
      hostname: os.hostname(),
      ip: this.ip(),
      workdir: think.ROOT_PATH,
      ostype: os.type(),
      release: os.release(),
      platform: os.platform(),
      arch: os.arch(),
      uptime: uptimeStr,
      cpus_num: cpus.length,
      cputype: cpus[0].model,
      port: port,
      lang: think.lang,
      node_ver: process.version,
      pid: process.pid,
      totalmem: parseFloat(os.totalmem() / 1024 / 1024).toFixed(2) + "M",
      freemem: parseFloat(os.freemem() / 1024 / 1024).toFixed(2) + "M",
      server_time: moment().format("YYYY-MM-DD HH:mm:ss")
    });
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
      yield this.session("vcode", null);  //删除验证码
      console.log("验证码：", data.code, vcode.code);
      if(!data.code || data.code.toLowerCase() != vcode.code) return this.fail(1001, "验证码错误!!");
      let user = yield this.model("admin").findByUserName(data.username);
      if(!think.isEmpty(user) && think.md5(data.password) === user.password) {
        yield this.session("admin", user);
        let log = {
          type: "登录",
          action: this.http.url,
          content: "登录成功",
          uname: user.username,
          ip: this.ip(),
          optime: moment().format("YYYY-MM-DD HH:mm:ss")
        };
        yield this.model("syslog").add(log);
        return this.redirect("index");
      }
      let log = {
        type: "登录",
        action: this.http.url,
        content: "登录失败",
        uname: data.username,
        ip: this.ip(),
        optime: moment().format("YYYY-MM-DD HH:mm:ss")
      };
      yield this.model("syslog").add(log);
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

  *logoutAction() {
    yield this.session();
    return this.redirect("/admin/login");
  }

  *testaddadminAction() {
    let admin = yield this.model("admin").findByUserName("admin");
    if(!think.isEmpty(admin)) return this.end("User is already exists!!");
    admin = {
      username: 'admin',
      password: think.md5('admin'),
      reg_date: moment().format("YYYY-MM-DD HH:mm:ss"),
      role: 1,
      rolename: "超级管理员"
    };
    let ret = yield this.model("admin").addAdmin(admin);
    return this.end("add success!");
  }

}