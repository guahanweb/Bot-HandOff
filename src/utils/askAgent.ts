import queue from '../lib/queue';
import * as builder from 'botbuilder';

/**
 * Specific pre-built suggestion cards that need to be sent to the agent for response.
 * Additionally, these cards will be queued up in case we don't yet have an agent connected.
 * 
 * @param bot
 * @param session 
 * @param suggestion The card or suggested response for the agent to approve/deny
 */
export default function askAgent(bot: builder.UniversalBot, session, suggestion: Function) {
    return new Promise((resolve, reject) => {
        let customerConversationId = session.message.address.channelId + '/' + session.message.address.conversation.id;
        let conversation = queue.get(customerConversationId);

        queue.add(customerConversationId, suggestion, null); // add to this customer queue
        queue.await(customerConversationId, resolve, reject); // update the pending promise for resolution

        if (conversation.agentAddress !== null) {
            // send to agent
            bot.send(suggestion(conversation.agentSession));
        }
        
        // agent will get queued text whenever they connect
    });
}
