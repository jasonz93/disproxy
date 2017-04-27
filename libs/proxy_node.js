/**
 * Created by zhangsihao on 2017/4/27.
 */
const _url = require('url');


class ProxyNode {
    constructor(doc, mq, internal) {
        this.id = doc._id.toString();
        this.url = doc.protocol + '://' + internal ? doc.internal_ip : doc.external_ip + ':' + doc.port;
        this.mq = mq;
        this.bans = doc.bans;
    }

    async ban(url) {
        let parsedUrl = _url.parse(url);
        let host = parsedUrl.hostname;
        let index = this.bans.indexOf(host);
        if (index < 0) {
            this.bans.push(index);
        }
        await this.mq.send({
            type: 'BAN_REQUEST',
            proxy_id: this.id,
            url: url
        });
    }

    async broken() {
        await this.mq.send({
            type: 'PROXY_BROKEN_REQUEST',
            proxy_id: this.id
        });
    }

    toString() {
        return this.url;
    }
}

module.exports = ProxyNode;