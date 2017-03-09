import {createStore} from 'redux';
import {AgentState} from './agent';

const reducer = (
    state: AgentState = {
        conversations: [],
        selectedConversation: null
    },
    action
) => {
	switch (action.type) {
        case 'ADD_CONVERSATION':
            return {
                ... state,
                conversations: [
                    ... state.conversations, 
                    action.conversation
                    ],
                selectedConversation: state.conversations.length == 0 ? action.conversation : state.selectedConversation
                };

        case 'SET_SELECTED_CONVERSATION':
            return {
                ... state,
                selectedConversation: action.selectedConversation
            };

        default:
            return state;
    }
}

export const store = createStore(reducer);
