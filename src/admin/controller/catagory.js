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
    console.log(list);
    this.assign("catagories", list);
    this.display();
  }

  addAction() {
    this.display();
  }

  *addcatagoryAction() {
    let info = this.post();
    if(!info.title || !info.type
      || isNaN(info.order) || parseInt(info.order) < 0
      || !info.abstract || !info.author) {
        return this.end('<script>alert("信息有误!!");history.go(-1);</script>');
    }
    info.date = moment().format("YYYY-MM-DD HH:mm:ss");
    yield this.model("catagory").addCatagory(info);
    this.redirect("list");
  }
}