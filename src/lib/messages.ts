import events = require('events');

interface MessageInterface {
    sender: string,
    recipient: string,
    message: string
}

class Messages extends events.EventEmitter {
    queue: MessageInterface[];

    constructor() {
        super();
        this.queue = [];
        this.emit('ready');
    }

    getQueue() {
        return this.queue;
    }

    send(msg) {
        this.queue.push(msg);
        this.emit('message', 'PROXY:' + msg.message);
    }
}

const messages = new Messages();
export default messages;