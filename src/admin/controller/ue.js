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
    if(callback) {
      if(callback.match(/^[\w_]+$/)) {
        return this.end((commonUtil.htmlspecialchars(callback) || "")
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

  //这是
  webuploaderAction() {
    console.log(">>>>");
    return this.end("{}");
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
  action_list(config, action) {
    let allowFiles = "",
        listSize = "",
        path = "";
    switch(action) {
      case 'listfile':
        allowFiles = config.fileManagerAllowFiles;
        listSize = config.fileManagerListSize;
        path = config.fileManagerListPath;
        break;
      case 'listimage':
      default:
        allowFiles = config.imageManagerAllowFiles;
        listSize = config.imageManagerListSize;
        path = config.imageManagerListPath;
    }
    allowFiles = allowFiles.join("").replace(".", "|").substr(1);
    let size = this.get("size");
    let start = this.get("start");
    size = commonUtil.htmlspecialchars(size) || listSize;
    start = commonUtil.htmlspecialchars(start) || 0;
    let end = start + size;
    path = think.ROOT_PATH + (path.substr(0, 1) == '/' ? "" : "/") + path;
    let files = this.getfiles(path, allowFiles);
    let len = files.length;
    if(!len) {
      return JSON.stringify({
        'state': 'no match file',
        'list': [],
        'start': start,
        'total': len
      });
    }
    let min = end < len ? end : len;
    for(let i = min - 1, list = [];i < len && i >= 0 && i >= start; i--) {
      list.push(files[i]);
    }
    return {
      state: 'SUCCESS',
      list: list,
      start: start,
      total: len
    }
  }

  /* 抓取远程图片 */
  action_crawler(config, action) {
    let cfg = {
      pathFormat: config.catcherPathFormat,
      maxSize: config.catcherMaxSize,
      allowFiles: config.catcherAllowFiles,
      oriName: "remote.png"
    }, fieldName = config.catcherFieldName;
    let list = [];
    let source = this.post(fieldName);
    source = source || this.get(fieldName);
    if(think.isArray(source)) {
      source.forEach(function(imgUrl) {
        let item = new Uploader(imgUrl, cfg, "remote");
        let info = item.getFileInfo();
        list.push({
          state: info.state,
          url: info.url,
          size: info.size,
          title: commonUtil.htmlspecialchars(info.title),
          original: commonUtil.htmlspecialchars(info.original),
          source: commonUtil.htmlspecialchars(imgUrl)
        });
      });
    }
    return JSON.stringify({
      state: !!list.length ? "SUCCESS" : "ERROR",
      list: list
    });
  }

  /**
   * 遍历获取目录下的指定类型的文件
   * @param path
   * @param allowFiles 指定文件类型，以|分隔，如jpg|png|exe
   * @return array
   */
  getfiles(path, allowFiles) {
    if(!think.isDir(path)) return null;
    if(path.substr(path, path.length - 1) != '/') path += '/';
    let files = [], fileList = null;
    try {
      fileList = fs.readdirSync(path);
    } catch(e) {
      console.log(e.message);
      return;
    }
    fileList.forEach(function(item) {
      if(item != '.' && item != '..') {
        path += path + item;
        if(think.isDir(path)) {
          files.concat(getfiles(path, allowFiles) || []);
        } else {
          let reg = new RegExp('/\.(' + allowFiles + ')$/i');
          if(item.match(reg)) {
            let stat = fs.statSync(path);
            files.push({
              url: path.substr(think.ROOT_PATH.length),
              mtime: stat.mtime
            })
          }
        }
      }
    });
    return files;
  }
}