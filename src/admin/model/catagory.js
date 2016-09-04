'use strict';
/**
 * model
 */
export default class extends think.model.mongo {

    findAll() {
        return this.order("order desc").select();
    }

    findById(_id) {
        return this.where({_id: _id}).find();
    }

    addCatagory(catagory) {
        return this.add(catagory);
    }

    /**
     * _id String ---> 删除一个记录
     * _id Array ---> 删除多个记录
     */
    delCatagory(_id) {
        if(Object.prototype.toString.call(_id) === '[object Array]') {
            return this.where({_id: {"$in": _id}}).delete();
        }
        return this.where({_id: _id}).delete();
    }

    updateCatagory(_id, catagory) {
        return this.where({_id: _id}).update(catagory);
    }

}