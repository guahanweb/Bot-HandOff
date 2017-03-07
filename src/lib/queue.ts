interface CustomerQueueItem {
    created: number,
    customerConversationId: string,
    agentConversationId: string,
    messages: string[]
}

class Queue {
    queue: CustomerQueueItem[];

    constructor() {
        this.queue = [];
    }

    add(customerConversationId: string, message: string) {
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
            agentConversationId: null,
            messages: [message]
        };

        this.queue.push(item);
        return item;
    }

    update(customerConversationId: string, agentConversationId: string) {
        this.queue.map((item) => {
            if (item.customerConversationId === customerConversationId) {
                item.agentConversationId = agentConversationId;
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

    getPendingCustomers() {
        return this.queue.filter((item) => {
            return item.agentConversationId === null;
        });
    }
}

export default new Queue();