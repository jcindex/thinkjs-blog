'use strict';

import fs from "fs";

import Base from './base.js';
import commonUtil from "../utils/common.util";

export default class extends Base {

  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    let config = fs.readFileSync(think.RESOURCE_PATH + think.sep + "static/lib/ueditor/1.4.3/php/config.json");
    config = typeof config === 'string' ? JSON.parse(config.replace(/\/\*[\s\S]+?\*\//, "")) : config;
    let result = null;
    switch(this.get("action")) {
      case 'config':
        result = JSON.stringify(config);
        break;
      /* 上传图片 */
      case 'uploadimage':
      /* 上传涂鸦 */
      case 'uploadscrawl':
      /* 上传视频 */
      case 'uploadvideo':
      /* 上传文件 */
      case 'uploadfile':
        result = this.action_upload(config);
        break;
      /* 列出图片 */
      case 'listimage':
        result = this.action_list(config);
        break;
      /* 列出文件 */
      case 'listfile':
        result = this.action_list(config);
        break;
      case 'catchimage':
        result = this.action_crawler(config);
        break;
      default: 
        result = JSON.stringify({
          state: '请求地址出错!!'
        });
        break;
    }
    let callback = this.get("callback");
    if(callback) {
      if(callback.match(/^[\w_]+$/)) {
        return this.end(commonUtil.htmlspecialchars(callback)
          + '(' + result + ')');
      } else {
        return this.end(JSON.stringify({
          state: 'callback参数不合法!'
        }));
      }
    } else {
      return this.end(result);
    }
  }

  action_upload(config) {

  }
  action_list(config) {

  }
  action_crawler(config) {

  }
}