'use strict';

import Base from './base.js';

/**
 * 咨询管理
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

  async listAction() {
    let list = await this.model("news").findAll();
    this.assign("newses", list);
    this.display();
  }

  async addAction() {
    this.display();
  }
}