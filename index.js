/**
 * Created by zhangsihao on 2017/4/27.
 */
const mongoose = require('mongoose');
const ProxyNode = require('./libs/proxy_node');
const Core = require('disproxy-core');
const ConnectorManager = new Core.ConnectorManager();
const _ = require('lodash');
const klaw = require('klaw');
const path = require('path');
const _url = require('url');

class Client {
    constructor(options) {
        this.options = options = _.defaults(options, {
            mongodb: 'mongodb://localhost/disproxy',
            message_queue: 'redis://localhost/disproxy_mq',
            broadcast: 'redis://localhost/disproxy_broadcast',
            internal: true,
            logger: console
        });
        this.logger = options.logger;
        this.mongo = mongoose.createConnection(options.mongodb);
        this.mq = ConnectorManager.getMessageQueue(options.message_queue);
        this.broadcastStr = options.broadcast;
        this.proxyModel = require('disproxy-core').Models.Proxy.AttachModel(this.mongo);
        this.proxyNodes = {};
        this.handlers = {};
        this.current = 0;
    }

    async init() {
        let proxies = await this.proxyModel.find().exec();
        for (let i in proxies) {
            let node = new ProxyNode(proxies[i], this.mq, this.options.internal);
            this.proxyNodes[node.id] = node;
        }
        await new Promise((resolve, reject) => {
            klaw(path.join(__dirname, 'handlers'))
                .on('data', (item) => {
                    if (_.endsWith(item.path, '.js')) {
                        let cons = require(item.path);
                        this.handlers[cons.getName()] = new cons(this);
                    }
                }).on('end', () => {
                    resolve();
            })
        });
        this.broadcast = ConnectorManager.getBroadcast(this.broadcastStr, (msg) => {
            (async () => {
                let handler = this.handlers[msg.type];
                if (handler) {
                    await handler.handle(msg);
                }
            })();
        });
    }

    getProxy(url, type) {
        let proxyIds = Object.getOwnPropertyNames(this.proxyNodes);
        if (proxyIds.length === 0) {
            this.logger.error('Local proxy pool is empty, make sure the client has been initialized.');
            return null;
        }
        if (!type) {
            type = 'ALIYUN';
        }
        let parsedUrl = _url.parse(url);
        let host = parsedUrl.hostname;
        for (let tries = 0; tries < proxyIds.length; tries ++) {
            if (this.current >= proxyIds.length) {
                this.current = 0;
            }
            let proxy = this.proxyNodes[proxyIds[this.current ++]];
            if (proxy.bans.indexOf(host) >= 0) {
                continue;
            } else if (proxy.type !== type) {
                continue;
            } else {
                return proxy;
            }
        }
        this.logger.error('All proxy has been ban for this host. %s', host);
        return null;
    }
}

module.exports = Client;