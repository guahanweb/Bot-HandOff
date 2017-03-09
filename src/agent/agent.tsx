import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps, User, DirectLineOptions, DirectLine, Activity, EventActivity } from 'botframework-webchat';
import ConversationState from '../framework/enum/ConversationState';
import { store } from './redux';
import { Provider, connect, Dispatch } from 'react-redux';
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

export interface AgentState {
    conversations: Conversation[],
    selectedConversation: Conversation
}

interface ConversationHeadersProps {
    conversations: Conversation[],
    selectedConversation: Conversation
    handleConversationChange: (id: string, conversations: Conversation[]) => void
}

const ConversationHeadersView = (props: ConversationHeadersProps) =>
    <div className='left-panel'>{
        props.conversations.map(conversation =>
            <ConversationHeader conversation={conversation} selected={conversation == props.selectedConversation} handleConversationChange={(id: string) => props.handleConversationChange(id, props.conversations)} key={conversation.customerInfo.id} />
        )
    }</div>

const ConversationHeader = (props: {
    conversation: Conversation,
    selected: boolean,
    handleConversationChange: (id: string) => void
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

interface WebChatsProps {
    conversations: Conversation[],
    selectedConversation: Conversation
}

const WebChatsView = (props: WebChatsProps) =>
    <div className='right-panel'>{
        props.conversations.length == 0 ?
            <div>No pending customers</div>
            :
            props.conversations.map(conversation =>
                <WebChat conversation={conversation} selected={conversation == props.selectedConversation} key={'WebChat' + conversation.customerInfo.id} />
            )
    }</div>;

class AgentDashboard extends React.Component<ChatProps, AgentState> {
    constructor(props: ChatProps) {
        super(props);
    }

    componentDidMount() {
        pendingConversation$(this.props).subscribe(conversation => {
            store.dispatch({
                type: 'ADD_CONVERSATION',
                conversation
            })
        });
    }

    render() {
        return (
            <Provider store={store}>
                <div className='agent-dashboard wc-app'>
                    <ConversationHeaders/>
                    <WebChats/>
                </div>
            </Provider>
        );
    }

}

const handleConversationChange = (
    dispatch: Dispatch<any>,
    id: string,
    conversations: Conversation[]
) =>
    dispatch({
        type: 'SET_SELECTED_CONVERSATION',
        selectedConversation: conversations.find(customer => customer.customerInfo.id === id)
    });

const WebChats = connect(
    (state: AgentState): WebChatsProps => ({
        conversations: state.conversations,
        selectedConversation: state.selectedConversation
    })
)(WebChatsView);

const ConversationHeaders = connect(
    (state: AgentState): Partial<ConversationHeadersProps> => ({
        conversations: state.conversations,
        selectedConversation: state.selectedConversation
    }),
    (dispatch: Dispatch<any>): Partial<ConversationHeadersProps> => ({
        handleConversationChange: (id, conversations) => handleConversationChange(dispatch, id,conversations)
    })
)(ConversationHeadersView);