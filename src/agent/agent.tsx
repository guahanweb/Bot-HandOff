import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, User, DirectLineOptions } from 'botframework-webchat';
import { ConversationHeader } from './conversation_header';
import ConversationState from '../framework/enum/ConversationState';


export const App = (props: {
    directLine: DirectLineOptions,
    user: User,
    bot: User
}, container: HTMLElement) => {
    ReactDOM.render(React.createElement(AgentDashboard, props), container);
}

const AgentDashboard = (props: {
    directLine: DirectLineOptions,
    user: User,
    bot: User
}) => {

    let conversations =
        [{ user: { id: '123', name: "Bill" }, conversationState: ConversationState.Bot, agent:null},
        { user: { id: '345', name: "Ana" }, conversationState: ConversationState.Waiting, agent:null},
        { user: { id: '444', name: "Garth" }, conversationState: ConversationState.Agent, agent: { id: 'AgentJoe', name: "AgentJoe" } },
        { user: { id: '4442', name: "Jane" }, conversationState: ConversationState.Agent, agent: { id: 'AgentHannah', name: "AgentHannah" } }];

    let conversationHeaders = [];
    conversations.forEach(conversation => {
        conversationHeaders.push(<ConversationHeader user={conversation.user}
         conversationState={conversation.conversationState} 
         key={conversation.user.id}
        agent={conversation.agent}/>)
    })

    return <div className='agent-dashboard'>

        <div className='left-panel'>
            {conversationHeaders}
        </div>
        <div className='right-panel'>
            <Chat
                directLine={props.directLine}
                user={props.user}
                bot={props.bot}
            />
        </div>
    </div>;
}