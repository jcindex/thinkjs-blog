'use strict';
/**
 * model
 */
export default class extends think.model.mongo {

    findAll() {
        return this.select();
    }

    findById(_id) {
        return this.where({_id: _id}).find();
    }

    addArticle(article) {
        return this.add(article);
    }

    delArticle(_id) {
        return this.where({_id: _id}).remove();
    }

    updateArticle(_id, article) {
        return this.where({_id: _id}).update(article);
    }
}