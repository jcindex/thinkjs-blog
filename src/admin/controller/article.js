'use strict';

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
      let fs = require("fs");
      if(fs.existsSync(simg.path)) {
        let ct = fs.readFileSync(simg.path);
        let dir = think.RESOURCE_PATH
                + think.sep + "upload" + think.sep + "Nardy.jpg";
        //think.mkdir(dir);
        let ret = fs.writeFileSync(dir, ct);
        console.log("CT:", ret);
      }
      return this.end("success!!");
    }
    let catagory = await this.model("catagory").findAll();
    this.assign("catagory", catagory);
    this.assign("article", null);
    return this.display();
  }

  *addInfo() {
    let file = this.file();
    console.log(file);
    return this.success("操作成功!!");
  }
}