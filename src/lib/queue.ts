import * as builder from 'botbuilder';
import ConversationState from '../framework/enum/ConversationState';

interface CustomerQueueItem {
    created: number,
    customerConversationId: string,
    customerAddress: builder.IAddress,
    agentConversationId: string,
    agentAddress: builder.IAddress,
    messages: builder.Message[],
    state: ConversationState,
    deferred: Object
}

class Queue {
    queue: CustomerQueueItem[];

    constructor() {
        this.queue = [];
    }

    getState(customerConversationId : string){
        var item = this.queue.filter(x => {
            return customerConversationId === x.customerConversationId;
        });

        return item[0].state;
    }

    setState(customerConversationId : string, state : ConversationState){
        var item = this.queue.filter(x => {
            return customerConversationId === x.customerConversationId;
        });

        if(item){
            item[0].state = state;
            return true;
        } else {
            return false;
        }
    }


    add(customerConversationId: string, message: builder.Message, customerAddress: builder.IAddress) {
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
            state: ConversationState.Bot,
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
            return item.state === ConversationState.Waiting;
        });
    }
}

export default new Queue();
