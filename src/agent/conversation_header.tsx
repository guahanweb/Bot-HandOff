
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ConversationState from '../framework/enum/ConversationState';
import { User } from 'botframework-webchat';

function handleConversationChange(e, user) {
    console.log("Switching to a new conversation", user);
}


export const ConversationHeader = (props: {
    user: User
}) => {
    return <div className='conversation-header' onClick={(e) => handleConversationChange(e, props.user)}>{props.user.name}</div>
}