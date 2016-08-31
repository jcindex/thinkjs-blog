'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  baseAction(){
    //auto render template file index_index.html
    return this.display();
  }
}