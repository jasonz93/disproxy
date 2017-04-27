/**
 * Created by zhangsihao on 2017/4/27.
 */
const BaseHandler = require('../libs/base_handler');

class ProxyOfflineHandler extends BaseHandler {
    constructor(client) {
        super(client);
    }

    static getName() {
        return 'PROXY_OFFLINE';
    }

    async handle(msg) {
        delete this.client.proxyNodes[msg.proxy_id];
    }
}

module.exports = ProxyOfflineHandler;