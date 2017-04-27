/**
 * Created by zhangsihao on 2017/4/27.
 */
const BaseHandler = require('../libs/base_handler');
const ProxyNode = require('../libs/proxy_node');

class ProxyOnlineHandler extends BaseHandler {
    constructor(client) {
        super(client);
    }

    static getName() {
        return 'PROXY_ONLINE';
    }

    async handle(msg) {
        let proxy = await this.client.proxyModel.findById(msg.proxy_id);
        if (proxy) {
            let node = new ProxyNode(proxy, this.client.mq, this.client.options.internal);
            this.client.proxyNodes[node.id] = node;
        } else {
            this.client.logger.warn('New online proxy node does not exist in mongo. ID: %s',msg.proxy_id);
        }
    }
}

module.exports = ProxyOnlineHandler;