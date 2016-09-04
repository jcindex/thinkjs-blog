'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    console.log("UE:", this.get(), this.post());
    //auto render template file index_index.html
    return this.display();
  }
}