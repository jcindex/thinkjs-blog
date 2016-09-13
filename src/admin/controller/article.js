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
    this.assign("articles", list);
    return this.display();
  }

  async addAction() {
    // let info = this.post();
    if(this.isPost()) {
      // return this.addInfo();
      console.log(this.file());
      let simg = this.file("simg");
      let up_dir = this.config("upload_images_dir");
      let date = moment().format("YYYY-MM-DD").split("-");
      up_dir = up_dir.replace("{yyyy}", date[0])
          .replace("{mm}", date[1])
          .replace("{dd}", date[2]);
      //创建目录失败
      if(!fs.existsSync(up_dir) && !think.mkdir(up_dir)) {
          return this.error(-1, "目录创建失败,缩略图上传失败!!");;
      } else if (!think.isWritable(up_dir)) {
          return this.error(-1, "文件写入失败,缩略图上传失败!!");;
      }
      let fileName = simg.path.substr(simg.path.lastIndexOf(think.sep) + 1);
      let filePath = path.normalize(up_dir + think.sep + fileName);
      //移动文件
      let buf = fs.readFileSync(simg.path);
      try {
          fs.writeFileSync(filePath, buf);
      } catch(e) {
          return this.error(-1, "移动文件失败!!");
      }
      return this.end("success!!");
    }
    let catagory = await this.model("catagory").findAll();
    this.assign("isupdate", false);
    this.assign("catagory", catagory);
    this.assign("article", null);
    return this.display();
  }

  async updateAction() {
    if(this.isPost()) {
      console.log(this.file());
      return this.end("post.///");
    }
    this.assign({
      isupdate: true
    });
    return this.display();
  }

  *addInfo() {
    let file = this.file();
    console.log(file);
    return this.success("操作成功!!");
  }
}