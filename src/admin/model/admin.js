'use strict';
/**
 * model
 */
export default class extends think.model.base {
    *updateAdmin(aid, opts) {
        
    }
    addAdmin(admin) {
        this.add(admin);
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