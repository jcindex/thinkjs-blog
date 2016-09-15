'use strict';

import moment from "moment";
import path from "path";
import fs from "fs";

import Base from './base.js';

/**
 * 文章管理
 */
export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  // indexAction(){
  //   //auto render template file index_index.html
  //   return this.display();
  // }

  *listAction() {
    let list = yield this.model("article").findAll();
    list = yield list.map(async (item)=> {
      let catagory = await this.model("catagory").findById(item.cid);
      item.catagory = catagory.title;
      return item;
    });
    this.assign("articles", list);
    return this.display();
  }

  async addAction() {
    if(this.isPost()) {
      console.log(this.post());
      let article = this.post();
      for(var key in article) {
        if(key.indexOf('$') != -1) return this.backLog("提交的信息包含被篡改的敏感字符！！");
      }
      let simg = this.file("simg");
      article.simg = this.uploadImg(simg).simg || "";
      article.addtime = moment().format("YYYY-MM-DD HH:mm:ss");
      article.reviews = 0;  //阅读次数
      article.deploy_state = 1; //发布状态，1为已经发布，0为未发布
      article.last_modify_time = moment().format("YYYY-MM-DD HH:mm:ss");//上次更新时间
      await this.model("article").addArticle(article);
      return this.backLog("添加成功，正在返回...");
    }
    let catagory = await this.model("catagory").findAll();
    this.assign("isupdate", false);
    this.assign("catagory", catagory);
    this.assign("article", null);
    return this.display();
  }

  uploadImg(simg) {
    if(!simg) return {};
    let up_dir = this.config("upload_images_dir");
    let date = moment().format("YYYY-MM-DD").split("-");
    up_dir = up_dir.replace("{yyyy}", date[0])
        .replace("{mm}", date[1])
        .replace("{dd}", date[2]);
    let target_dir = path.normalize(think.RESOURCE_PATH + up_dir);
    //创建目录失败
    if(!fs.existsSync(target_dir) && !think.mkdir(target_dir)) {
        return this.backLog("目录创建失败,缩略图上传失败!!");
    } else if (!think.isWritable(target_dir)) {
        return this.backLog("文件写入失败,缩略图上传失败!!");
    }
    let fileName = simg.path.substr(simg.path.lastIndexOf(think.sep) + 1);
    let filePath = path.normalize(target_dir + think.sep + fileName);
    //移动文件
    let buf = fs.readFileSync(simg.path);
    try {
        fs.writeFileSync(filePath, buf);
    } catch(e) {
        return this.backLog("移动文件失败!!");
    }
    return {
      simg: path.normalize(up_dir + think.sep + fileName),
    };
  }

  async ajaxmodAction() {
    let info = this.get();
    let article = await this.model('article').findById(info._id);
    for(var key in info) {
      if(key.indexOf('$') != -1) return this.backLog("提交的信息包含被篡改的敏感字符！！");
      article[key] = info[key];
    }
    article.last_modify_time = moment().format("YYYY-MM-DD HH:mm:ss");
    let ret = await this.model('article').updateArticle(article);
    return this.json(ret);
  }

  async updateAction() {
    if(this.isPost()) {
      let info = this.post();
      let article = await this.model('article').findById(info._id);
      for(var key in article) {
        if(key.indexOf('$') != -1) return this.backLog("提交的信息包含被篡改的敏感字符！！");
        if(info[key]) article[key] = info[key];
      }
      let simg = this.file("simg");
      simg = this.uploadImg(simg).simg;
      if(!think.isEmpty(simg)) article.simg = simg;
      article.last_modify_time = moment().format("YYYY-MM-DD HH:mm:ss");
      await this.model("article").updateArticle(article);
      return this.backLog("更新成功，正在返回", null, "list");
    }
    let _id = this.get("_id");
    if(!_id) return this.backLog("参数错误，文章修改失败!!", null, "list");
    let article = await this.model('article').findById(_id);
    let catagory = await this.model('catagory').findAll();
    this.assign({
      _id: _id,
      catagory: catagory || [],
      article: article || {},
      isupdate: true
    });
    return this.display("add");
  }
  async delAction() {
    let _id = this.get("_id");
    if(!_id) return this.backLog("参数错误，文章删除失败!!", null, "list");
    let ret = await this.model("article").delArticle(_id);
    return this.end(ret);
  }
  async batchDelAction() {
    let _id = this.get("_id");
    if(!_id) return this.backLog("参数错误，文章删除失败!!", null, "list");
    let ids = _id.split("|");
    let ret = await this.model("article").batchDel(ids);
    return this.end(ret||{});
  }
}