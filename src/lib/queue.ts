import * as builder from 'botbuilder';

interface CustomerQueueItem {
    created: number,
    customerConversationId: string,
    customerAddress: builder.IAddress,
    agentConversationId: string,
    agentAddress: builder.IAddress,
    messages: string[],
    deferred: Object
}

class Queue {
    queue: CustomerQueueItem[];

    constructor() {
        this.queue = [];
    }

    add(customerConversationId: string, message: string, customerAddress: builder.IAddress) {
        let item;
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].customerConversationId === customerConversationId) {
                this.queue[i].messages.push(message);
                return this.queue[i];
            }
        }

        item = {
            created: Date.now(),
            customerConversationId: customerConversationId,
            customerAddress: customerAddress,
            agentConversationId: null,
            agentAddress: null,
            messages: [message],
            deferred: null
        };

        this.queue.push(item);
        return item;
    }

    update(customerConversationId: string, agentConversationId: string, agentAddress: builder.IAddress) {
        this.queue.map((item) => {
            if (item.customerConversationId === customerConversationId) {
                item.agentConversationId = agentConversationId;
                item.agentAddress = agentAddress;
            }
            return item;
        });
    }

    get(customerConversationId: string) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].customerConversationId === customerConversationId) {
                return this.queue[i];
            }
        }
        return null;
    }

    getCustomerByAgent(agentConversationId: string) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].agentConversationId === agentConversationId) {
                return this.queue[i];
            }
        }
        return null;        
    }

    await(customerConversationId: string, resolve: Function, reject: Function) {
        this.queue.map((item) => {
            if (item.customerConversationId === customerConversationId) {
                item.deferred = {
                    resolve: resolve,
                    reject: reject
                };
            }
            return item;
        });
    }

    getPendingCustomers() {
        return this.queue.filter((item) => {
            return item.agentConversationId === null;
        });
    }
}

export default new Queue();