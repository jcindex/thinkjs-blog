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

    addCatagory(catagory) {
        return this.add(catagory);
    }

    delCatagory(_id) {
        return this.where({_id: _id}).remove();
    }

    updateCatagory(_id, catagory) {
        return this.where({_id: _id}).update(catagory);
    }

}