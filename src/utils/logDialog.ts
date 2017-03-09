import queue from '../lib/queue';
import * as builder from 'botbuilder';
import ConversationState from '../framework/enum/ConversationState';

export default function logDialog(session, userMsg : string, botMsg: string) {
    let customerConversationId = session.message.address.channelId + '/' + session.message.address.conversation.id;
    let conversation = queue.get(customerConversationId);
    queue.add(customerConversationId, new builder.Message().text(userMsg), null); // add to this customer queue
    queue.add(customerConversationId, new builder.Message().text(botMsg), null); // add to this customer queue
}
