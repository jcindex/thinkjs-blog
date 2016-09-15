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
        return this.where({_id: _id}).delete();
    }

    batchDel(ids) {
        ids.forEach((item) => {
            this.delArticle(item);
        });
        //return this.where({_id:['in', ids]}).delete();
    }

    updateArticle(article) {
        return this.where({_id: article._id}).update(article);
    }
}