'use strict';
/**
 * model
 */
export default class extends think.model.base {

    addLog(log) {
        return this.add(log);
    }
}