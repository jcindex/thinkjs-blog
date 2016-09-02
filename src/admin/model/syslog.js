'use strict';
/**
 * model
 */
export default class extends think.model.mongo {

    addLog(log) {
        return this.add(log);
    }

    list() {
        return this.order("optime desc").select();
    }

    delLog(_id) {
        return this.where({_id: _id}).delete();
    }

    searchList(where) {
        return this.where(where).select();
    }
}