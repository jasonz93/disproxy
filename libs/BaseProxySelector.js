/**
 * Created by nicholas on 17-3-1.
 */
const Etcd = require('etcd-cli');
const path = require('path');
const Promise = require('bluebird');

/**
 * @name Proxy
 * @property {string} type Proxy type, currently http
 * @property {string} host IP address of the proxy
 * @property {int} port Port the proxy listened
 * @property {number} upFrom Start time of the proxy in milli timestamp.
 */

/**
 * @class
 */
class BaseProxySelector {
    /**
     * @param {string|Array} etcdHosts
     * @param {string} [namespace]
     * @param {string} [prefix]
     */
    constructor(etcdHosts, namespace, prefix) {
        if (typeof prefix !== 'string') {
            prefix = 'disproxy';
        }
        if (typeof namespace !== 'string') {
            namespace = 'default';
        }
        this._etcd = new Etcd.V2HTTPClient(etcdHosts);
        this._namespace = namespace;
        this._prefix = prefix;
    }

    /**
     * Selector must be started before select a proxy
     * @param {function} callback
     */
    start(callback) {
        let key = path.join(this._prefix, this._namespace);
        this._etcd.get(key, {
            recursive: true
        }, (err, data) => {
            if (err) {
                return callback(err);
            }
            this.onProxyListChanged(data);
            this._etcd.watcher(key, data.node.modifiedIndex + 1, (err, watcher) => {
                this._watcher = watcher;
                this._watcher.on('change', (data) => {
                    this.onProxyListChanged(data);
                });
                this._watcher.start(callback);
            });
        });
    }

    /**
     * Promise for start method
     * @returns {Promise}
     */
    startP() {
        return new Promise((resolve, reject) => {
            this.start((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
    }

    /**
     * Stop the selector
     */
    stop() {
        if (this._watcher) {
            this._watcher.stop();
        }
    }

    /**
     * Select a proxy
     * @param {function} callback
     */
    select(callback) {
        callback(new Error('Method not implemented.'));
    }

    /**
     * Promise for select method
     * @returns {Promise.<Proxy>}
     */
    selectP() {
        return new Promise((resolve, reject) => {
            this.select((err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    onProxyListChanged(data) {
        let regionNodes = data.node.nodes;
        if (!regionNodes) regionNodes = [];
        this._hosts = [];
        regionNodes.forEach((regionNode) => {
            let hosts = regionNode.nodes;
            if (!hosts) hosts = [];
            hosts.forEach((hostNode) => {
                this._hosts.push(JSON.parse(hostNode.value));
            });
        });
    }
}

module.exports = BaseProxySelector;