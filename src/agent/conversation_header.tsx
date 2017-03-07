
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ConversationState from '../framework/enum/ConversationState';
import { User } from 'botframework-webchat';

function getConversationStateString(conversationState, agent) {
    switch (conversationState) {
        case ConversationState.Bot:
            return 'is talking to a bot';
        case ConversationState.Agent:
            if(agent.id == 'AgentHannah'){ //suppose AgentHannah is a current agent
                 return 'is talking to you';
            }
            return 'is talking to agent '+ agent.name;
        default:
            return 'is waiting for agent';
    }
}
function handleConversationChange(e, user) {
    console.log("Switching to a new conversation", user);
}

function handleConnect(e, user) {
    console.log("Connecting to customer", user);
}

function handleDisconnect(e, user) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Disconnecting from customer", user);
}

export const ConversationHeader = (props: {
    user: User,
    conversationState: ConversationState,
    agent:User
}) => {
    return <div className='conversation-header' onClick={(e) => handleConversationChange(e, props.user)}>
        <div className="customer-name">{props.user.name}</div>
        <div>{getConversationStateString(props.conversationState, props.agent)}</div>
        {(props.conversationState == ConversationState.Agent  && props.agent.id === "AgentHannah") ?
            <a onClick={(e) => handleDisconnect(e, props.user)}>disconnect</a>
            :
            <a onClick={(e) => handleConnect(e, props.user)}>connect</a>
        }
    </div>;
}