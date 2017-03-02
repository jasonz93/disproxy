/**
 * Created by nicholas on 17-2-24.
 */
const Selector = require('../libs/RoundRobinProxySelector');
const {expect} = require('chai');
const child_process = require('child_process');
const path = require('path');
const _ = require('lodash');

describe('Proxy selector test', () => {
    let selector = new Selector('127.0.0.1:2379');
    let proxyProcess;
    it('Start proxy', (done) => {
        proxyProcess = child_process.fork(path.join(__dirname, '..', 'bin', 'server'), {silent: true});
        proxyProcess.stdout.on('data', (data) => {
            data = data.toString();
            if (data.indexOf('Proxy node record has been set.') >= 0) {
                done();
            }
        });
    });

    it('Start the selector', (done) => {
        selector.start(() => {
            done();
        })
    });

    it('Stop the selector', () => {
        selector.stop();
    });

    it('Start the selector in promise way', (done) => {
        selector.startP().then(done).catch(done);
    });

    it('Test selector', (done) => {
        selector.select((err, host) => {
            expect(err).to.be.equal(null);
            expect(host).not.to.be.equal(null);
            expect(host.host).not.to.be.equal(null);
            expect(host.port).not.to.be.equal(null);
            done();
        });
    });

    it('Test select in promise way', (done) => {
        selector.selectP().then((host) => {
            expect(host).not.to.be.equal(null);
            expect(host.host).not.to.be.equal(null);
            expect(host.port).not.to.be.equal(null);
            done();
        }).catch(done);
    });

    it('Close proxy', (done) => {
        selector.stop();
        proxyProcess.on('exit', (code, signal) => {
            console.log('Proxy exited', code, signal);
            done();
        });
        proxyProcess.kill('SIGINT');
    })
});
