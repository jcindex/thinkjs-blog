'use strict';

import fs from "fs";

import Base from './base.js';
import commonUtil from "../utils/common.util";
import Uploader from "../../common/util/uploader";

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    let config = fs.readFileSync(think.RESOURCE_PATH + think.sep + "static/lib/ueditor/1.4.3/php/config.json");
    config = config.toString().replace(/\/\*.*\*\//igm, "");
    config = config && JSON.parse(config.replace(/\/\*[\s\S]+?\*\//, ""));
    let result = null;
    let action = this.get("action");
    switch(action) {
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
        result = this.action_upload(config, action);
        break;
      /* 列出图片 */
      case 'listimage':
        result = this.action_list(config, action);
        break;
      /* 列出文件 */
      case 'listfile':
        result = this.action_list(config, action);
        break;
      case 'catchimage':
        result = this.action_crawler(config, action);
        break;
      default: 
        result = JSON.stringify({
          state: '请求地址出错!!'
        });
        break;
    }
    let callback = this.get("callback");
    //url 
    // /admin/ue/index.html?action=config&&noCache=1473250872555
    console.log(">>>>",callback, result);
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

  action_upload(config, action) {
    let cfg = {};
    let fieldName = "";
    let base64 = 'upload';
    switch(action) {
      case 'uploadimage':
        cfg = {
          pathFormat: config.imagePathFormat,
          maxSize: config.imageMaxSize,
          allowFiles: config.imageAllowFiles
        };
        fieldName = config.imageFieldName;
        break;
      case 'uploadscrawl':
        cfg = {
          pathFormat: config.scrawlPathFormat,
          maxSize: config.scrawlMaxSize,
          allowFiles: config.scrawlAllowFiles,
          oriName: "scrawl.png"
        };
        fieldName = config.scrawlFieldName;
        base64 = "base64";
        break;
      case 'uploadvideo':
        cfg = {
          pathFormat: config.videoPathFormat,
          maxSize: config.videoMaxSize,
          allowFiles: config.videoAllowFiles,
          oriName: "scrawl.png"
        };
        fieldName = config.videoFieldName;
        break;
      case 'uploadfile':
      default:
        cfg = {
          pathFormat: config.videoPathFormat,
          maxSize: config.videoMaxSize,
          allowFiles: config.videoAllowFiles,
          oriName: "scrawl.png"
        };
        fieldName = config.videoFieldName;
        break;
    }
    let uploader = new Uploader(this, fieldName, config, base64);
    return JSON.stringify(uploader.getFileInfo());
  }
  action_list(config) {

  }
  action_crawler(config) {

  }
}