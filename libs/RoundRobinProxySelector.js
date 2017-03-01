/**
 * Created by nicholas on 17-3-1.
 */
const BaseProxySelector = require('./BaseProxySelector');

class RoundRobinProxySelector extends BaseProxySelector {
    constructor(etcdHosts, namespace, prefix) {
        super(etcdHosts, namespace, prefix);
        this._index = 0;
    }

    select(callback) {
        if (this._index > 10000) {
            this._index = 0;
        }
        let len = this._hosts.length;
        if (len === 0) {
            callback(new Error('No online proxy.'));
        } else {
            callback(null, this._hosts[(this._index++) % len]);
        }
    }
}

module.exports = RoundRobinProxySelector;