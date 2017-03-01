/**
 * Created by nicholas on 17-3-1.
 */
class Heartbeat {
    constructor(etcd, key, ttl) {
        this._etcd = etcd;
        this._key = key;
        this._ttl = ttl;
    }

    start() {
        this._heartbeat = setInterval(() => {
            this._etcd.ttl(this._key, this._ttl, (err, data) => {
                if (err) {
                    return console.log('Failed to send heartbeat, this node will be offline.');
                }
                console.log('Heartbeat sent.');
            })
        }, this._ttl * 1000 / 3);
    }

    stop() {
        if (this._heartbeat) {
            clearInterval(this._heartbeat);
        }
    }
}

module.exports = Heartbeat;