/**
 * Created by nicholas on 17-2-24.
 */
'use strict';

const http = require('http');
const proxy = require('proxy');
const os = require('os');
const _ = require('lodash');
const Etcd = require('etcd-cli');
const Heartbeat = require('./libs/Heartbeat');

function buildOptions() {
    function getByPriority() {
        for (let i = 0; i < arguments.length; i ++) {
            if (arguments[i]) {
                let arr = arguments[i].split(',');
                if (arr.length > 1) return arr;
                else return arr[0];
            }
        }
        return '';
    }

    let env = process.env;
    return {
        etcd_host: getByPriority(env.ETCD_HOST, 'http://127.0.0.1:2379'),
        etcd_prefix: getByPriority(env.ETCD_PREFIX, 'disproxy'),
        namespace: getByPriority(env.NAMESPACE, 'default'),
        region: getByPriority(env.REGION, 'default'),
        ip_prefix: getByPriority(env.IP_PREFIX, '')
    }
}

function detectAvailableIPs(ip_prefix) {
    if (typeof ip_prefix === 'undefined') {
        ip_prefix = '';
    }
    let nics = os.networkInterfaces();

    let ips = [];

    for (let nic in nics) {
        if (_.startsWith(nic, 'eth') || _.startsWith(nic, 'en')) {
            nics[nic].forEach((address) => {
                if (address.family === 'IPv4' && !address.internal && _.startsWith(address.address, ip_prefix)) {
                    ips.push(address.address);
                }
            })
        }
    }

    if (ips.length > 0) {
        return ips[0];
    } else {
        return null;
    }
}

function buildKey(ip) {
    return '/' + options.etcd_prefix + '/' + options.namespace + '/' + options.region + '/' + ip;
}

let options = buildOptions();
let ip = detectAvailableIPs(options.ip_prefix);

console.log('Your publish ip is', ip, 'or you can set it by environment variables.');





const server = proxy(http.createServer());

let etcd = new Etcd.V2HTTPClient(options.etcd_host);

let heartbeat = new Heartbeat(etcd, buildKey(ip), 30);

process.on('SIGINT', () => {
    console.log('SIGINT received.');
    heartbeat.stop();
    let etcdSync = etcd.sync();
    etcdSync.remove(buildKey(ip));
    server.close(() => {
        process.exit();
    });
});

server.listen(3128, () => {
    let port = server.address().port;
    console.log('Proxy server listening on port %d', port);
    etcd.set(buildKey(ip), JSON.stringify({
        type: 'http',
        host: ip,
        port: port,
        upFrom: new Date().getTime()
    }), {
        ttl: 30
    }, (err, res) => {
        if (err) {
            return console.log('Failed to set proxy node record.', err);
        }
        console.log('Proxy node record has been set.', res);
        heartbeat.start();
    });
});
