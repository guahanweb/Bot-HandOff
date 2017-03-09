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
            <ConversationHeader conversation={conversation} selected={conversation == props.selectedConversation} handleConversationChange={props.handleConversationChange} key={conversation.customerInfo.id} />
        )
    }</div>

const ConversationHeader = (props: {
    conversation: Conversation,
    selected: boolean,
    handleConversationChange: (string) => void
}) =>
    <div
        className={'conversation-header ' + (props.selected ? 'selected' : '')}
        onClick={() => props.handleConversationChange(props.conversation.customerInfo.id)}
        key={props.conversation.customerInfo.id}
    >
        {props.conversation.customerInfo.name}
    </div>;

const WebChat = (props: {
    conversation: Conversation,
    selected: boolean
}) =>
    <div
        style={{ visibility: props.selected ? 'visible' : 'hidden' }}
    >
        {props.conversation.webChatInstance}
    </div>;

const WebChats = (props: {
    conversation: Conversation[],
    selectedConversation: Conversation
}) =>
    <div className='right-panel'>{
        props.conversation.map(conversation =>
            <WebChat conversation={conversation} selected={conversation == props.selectedConversation} key={'WebChat' + conversation.customerInfo.id} />
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
        pendingConversation$(this.props).subscribe(conversation => {
            let state: any = { conversations: [...this.state.conversations, conversation] };

            if (this.state.conversations.length == 0) {
                state.selectedConversation = conversation;
            }
            this.setState(state);
            console.log("rx loop", conversation.customerInfo.id, this.state);
        });
    }

    handleConversationChange(id) {
        console.log(this.state);
        this.setState({ selectedConversation: this.state.conversations.find(customer => customer.customerInfo.id === id) });
    }

    render() {
        return (
            <div className='agent-dashboard'>
                {this.state.conversations.length == 0 ?
                    <div>No pending customers</div>
                    :
                    <div>
                        <ConversationHeaders conversations={this.state.conversations} selectedConversation={this.state.selectedConversation} handleConversationChange={this.handleConversationChange.bind(this)} />
                        <WebChats conversation={this.state.conversations} selectedConversation={this.state.selectedConversation} />
                    </div>
                }
            </div>
        );
    }

}