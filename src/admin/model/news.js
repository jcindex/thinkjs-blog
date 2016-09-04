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

    addArticle(news) {
        return this.add(news);
    }

    delNews(_id) {
        return this.where({_id: _id}).remove();
    }

    updateNews(_id, news) {
        return this.where({_id: _id}).update(news);
    }
}