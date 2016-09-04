'use strict';

import moment from "moment";
import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  // indexAction(){
  //   //auto render template file index_index.html
  //   return this.display();
  // }
  async listAction() {
    let list = await this.model("catagory").findAll();
    this.assign("catagories", list);
    this.display();
  }

  addAction() {
    this.assign("cat", null);
    this.display();
  }

  *addcatagoryAction() {
    let info = this.post();
    if(!info.title || !info.type
      || isNaN(info.order) || parseInt(info.order) < 0
      || !info.abstract || !info.author) {
        return this.end('<script>alert("信息有误!!");history.go(-1);</script>');
    }
    if(!info.cid) {
      info.date = moment().format("YYYY-MM-DD HH:mm:ss");
      yield this.model("catagory").addCatagory(info);
    } else {
      yield this.model("catagory").updateCatagory(info.cid, info);
    }
    this.redirect("list");
  }

  async editAction() {
    let _id = this.get("cid");
    if(!_id) this.end('<script>alert("找不到栏目!!");history.go(-1);</script>');
    let catagory = await this.model("catagory").findById(_id);
    this.assign("cat", catagory);
    this.display("add");
  }

  *delAction() {
    let _id = this.get("cid");
    if(_id.indexOf("|") !== -1) {
      _id = _id.split("|");
    }
    if(!_id) this.fail(1000, "栏目不存在!!");
    let ret = yield this.model("catagory").delCatagory(_id);
    this.success("删除成功!");
  }
}