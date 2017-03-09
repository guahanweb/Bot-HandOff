import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps, User, DirectLineOptions, DirectLine, Activity, EventActivity } from 'botframework-webchat';
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

const pendingConversation$ = (props: ChatProps) =>
    Observable.interval(1 * 1000)
        .flatMap(_ => Observable.ajax.get("/pending"))
        .map(ajaxResponse => ajaxResponse.response as PendingResponse)
        .map(pendingResponse => pendingResponse.customers)
        .flatMap(customers => Observable.from(customers))
        .distinct(customer => customer.customerConversationId)
        .flatMap(customer => {
            const dl = new DirectLine(props.directLine);

            const conversation = {
                customerInfo: customer.customerAddress.user,
                webChatInstance: <Chat
                    key={customer.customerAddress.user.id}
                    botConnection={dl}
                    user={props.user}
                    bot={props.bot}
                />
            } as Conversation;

            return dl.postActivity({
                type: 'event',
                from: props.user,
                name: 'connect_agent',
                value: { customerConversationId: customer.customerConversationId }
            } as EventActivity)
                .do(response => console.log("postActivity response", response))
                .map(_ => conversation);
        });

interface Conversation {
    customerInfo: any,
    webChatInstance: JSX.Element
}

interface AgentState {
    conversations: Conversation[],
    selectedConversation: Conversation
}

const ConversationHeaders = (props: {
    conversations: Conversation[],
    selectedConversation: Conversation,
    handleConversationChange: (string) => void
}) =>
    <div className='left-panel'>{
        props.conversations.map(conversation =>
            <ConversationHeader conversation={ conversation } selected={ conversation == props.selectedConversation } handleConversationChange={ props.handleConversationChange }/>
        )
    }</div>

const ConversationHeader = (props: {
    conversation: Conversation,
    selected: boolean,
    handleConversationChange: (string) => void
}) =>
    <div
        className={ 'conversation-header ' + (props.selected ? 'selected' : '') }
        onClick={ () => props.handleConversationChange(props.conversation.customerInfo.id) }
        key={ props.conversation.customerInfo.id }
    >
        { props.conversation.customerInfo.name }
    </div>;

const WebChat = (props: {
    conversation: Conversation,
    selected: boolean
}) =>
    <div>
        style={ { visibility: props.selected ? 'visible' : 'hidden' } }
        key={ props.conversation.customerInfo.id }
    >
        { props.conversation.webChatInstance }
    </div>;

const WebChats = (props: {
    conversation: Conversation[],
    selectedConversation: Conversation
}) =>
    <div className='right-panel'>{
        props.conversation.map(conversation =>
            <WebChat conversation={ conversation } selected={ conversation == props.selectedConversation } />
        )
    }</div>;

class AgentDashboard extends React.Component<ChatProps, AgentState> {
    constructor(props: ChatProps) {
        super(props);
        this.state = {
            conversations: [] as Conversation[],
            selectedConversation: null
        } as AgentState;
    }

    componentDidMount() {
        pendingConversation$(this.props).subscribe(customer => {
            let state: any = { customers: [...this.state.conversations, customer] };

            if (this.state.conversations.length == 0) {
                state.selectedCustomer = customer;
            }
            this.setState(state);
        });
    }

    handleConversationChange(id) {
        this.setState({ selectedConversation: this.state.conversations.find(customer => customer.customerInfo.id === id) });
    }

    render() {
        return (
            <div className='agent-dashboard'>
                <ConversationHeaders conversations={  this.state.conversations } selectedConversation={ this.state.selectedConversation } handleConversationChange={ this.handleConversationChange }/>
                <WebChats conversation={ this.state.conversations } selectedConversation={ this.state.selectedConversation }/>
            </div>
        );
    }

}