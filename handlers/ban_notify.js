/**
 * Created by zhangsihao on 2017/4/27.
 */
const BaseHandler = require('../libs/base_handler');

class BanNotifyHandler extends BaseHandler {
    constructor(client) {
        super(client);
    }

    static getName() {
        return 'BAN_NOTIFY';
    }

    async handle(msg) {
        let proxy = this.client.proxyNodes[msg.proxy_id];
        if (proxy) {
            proxy.bans.push(msg.host);
        }
    }
}

module.exports = BanNotifyHandler;