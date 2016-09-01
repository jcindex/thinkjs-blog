'use strict';
/**
 * model
 */
export default class extends think.model.mongo {
    *addAdmin(admin) {
        let ret = yield this.add(admin);
        return ret;
    }
    *findByUserName(username) {
        let admin = yield this.where({username: username}).find();
        return admin;
    }
}