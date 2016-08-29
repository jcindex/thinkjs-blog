'use strict';

import Base from './base.js';
import ccap from "ccap-dev";
import util from "../utils/common.util";

var captcha = ccap({
  width: 105,
  height: 41,
  offset: 22,
  quality: 100,
  fontsize: 0.5,
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

  loginAction() {
    return this.display();
  }

  imageAction() {
    var ary = captcha.get();
    console.log("===>", ary[0]);
    this.header("content-type","image/png");
    this.write(ary[1]);
    this.end();
  }

}