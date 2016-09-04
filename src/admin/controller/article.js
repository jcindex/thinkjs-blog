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
    this.display();
  }

  async addAction() {
    // let info = this.post();
    let catagory = await this.model("catagory").findAll();
    this.assign("catagory", catagory);
    this.assign("article", null);
    this.display();
  }
}