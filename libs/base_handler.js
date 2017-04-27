/**
 * Created by zhangsihao on 2017/4/27.
 */
class BaseHandler {
    constructor(client) {
        this.client = client;
    }

    static getName() {
        throw new Error('Method not implemented.');
    }

    async handle(msg) {
        throw new Error('Method not implemented.');
    }
}