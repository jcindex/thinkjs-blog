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
    // delUser(_id) {
    //     // this.remove();
    // }

    *findAll() {
        return yield this.select();
    }

    *findByUserName(uname) {
        return yield this.where({
            username: uname
        }).find();
    }

}