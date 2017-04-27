/**
 * Created by nicholas on 17-2-24.
 */
const DisProxy = require('../');
const {expect} = require('chai');
const child_process = require('child_process');
const path = require('path');
const _ = require('lodash');

describe('Proxy selector test', () => {
    let client = new DisProxy();
    let url = 'http://www.' + Math.random() + '.com';

    it('Init client', async function () {
        await client.init();
    });

    it('Test get proxy', function () {
        let proxy = client.getProxy(url);
        expect(proxy).not.to.be.equal(null);
    });

    it('Test get unexist type proxy', function () {
        let proxy = client.getProxy('http://www.baidu.com', 'XXX');
        expect(proxy).to.be.equal(null);
    });

    it('Test get ban proxy', function () {
        let proxy = client.getProxy(url);
        expect(proxy).not.to.be.equal(null);
        proxy.ban(url);
        proxy = client.getProxy(url);
        expect(proxy).to.be.equal(null);
    })
});
