'use strict';
/**
 * model
 */
export default class extends think.model.mongo {

    addLog(log) {
        return this.add(log);
    }
}