'use strict';
/**
 * model
 */
export default class extends think.model.mongo {
    *addUser(user) {
        if(!user) return null;
        console.log("addUser");
        let ret = yield this.add(user);
        return ret;
    }
    delUser(_id) {
        // this.remove();
    }

    *findAll() {
        return this.select();
    }
    findByUserName(uname) {
        return this.where({
            username: uname
        }).find();
    }

}