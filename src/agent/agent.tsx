import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps, User, DirectLineOptions, DirectLine, Activity, EventActivity } from 'botframework-webchat';
import { ConversationHeader } from './conversation_header';
import ConversationState from '../framework/enum/ConversationState';
import { store } from './redux';

import { Observable } from 'rxjs';

export const App = (props: ChatProps, container: HTMLElement) => {
    ReactDOM.render(React.createElement(AgentDashboard, props), container);
}

type customerAddress = any;

interface PendingResponse {
    customers: customerAddress[];
}

const pendingCustomers = (props: ChatProps) =>
    Observable.interval(3 * 1000)
        .flatMap(_ => Observable.ajax.get("/pending"))
        .map(ajaxResponse => ajaxResponse.response as PendingResponse)
        .map(pendingResponse => pendingResponse.customers)
        .flatMap(customers => Observable.from(customers))
        .distinct(customer => customer.customerConversationId)
        .flatMap(customer => {
            const dl = new DirectLine(props.directLine);

            const newCustomer = {
                customerInfo: customer.customerAddress.user,
                webChatInstance: <Chat
                    key={customer.customerAddress.user.id}
                    botConnection={dl}
                    user={props.user}
                    bot={props.bot}
                />
            } as Customer;

            return dl.postActivity({
                type: 'event',
                from: props.user,
                name: 'connect_agent',
                value: { customerConversationId: customer.customerConversationId }
            } as EventActivity)
                .do(response => console.log("postActivity response", response))
                .map(_ => newCustomer);
        });

interface Customer {
    customerInfo: any,
    webChatInstance: JSX.Element
}

interface AgentState {
    customers: Customer[],
    selectedCustomer: Customer
}

class AgentDashboard extends React.Component<ChatProps, AgentState> {
    constructor(props: ChatProps) {
        super(props);
        this.state = {
            customers: [] as Customer[],
            selectedCustomer: null
        } as AgentState;
    }

    componentDidMount() {
        pendingCustomers(this.props).subscribe(customer => {
            let state: any = { customers: [...this.state.customers, customer] };

            if (this.state.customers.length == 0) {
                state.selectedCustomer = customer;
            }
            this.setState(state);
        });
    }

    handleConversationChange(id) {
        this.setState({ selectedCustomer: this.state.customers.find(customer => customer.customerInfo.id === id) });
    }

    render() {
        const conversationHeaders = this.state.customers.map(customer =>
            <div
                className={'conversation-header ' + (this.state.selectedCustomer.customerInfo.id === customer.customerInfo.id ? 'selected' : '')}
                onClick={() => this.handleConversationChange(customer.customerInfo.id)}
                key={customer.customerInfo.id}
            >
            {customer.customerInfo.name}
            </div>
        )
        const selectedCustomer = this.state.selectedCustomer;
        const webChatInstances = this.state.customers.map(customer =>
            <div
                style={{ visibility: customer === selectedCustomer ? 'visible' : 'hidden' }}
                key={customer.customerInfo.id}
            >
                {customer.webChatInstance}
            </div>
        )

        return (
            <div className='agent-dashboard'>
                <div className='left-panel'>
                    {conversationHeaders}
                </div>
                <div className='right-panel'>
                    {webChatInstances}
                </div>
            </div>
        );
    }

}