import queue from '../lib/queue';
import ConversationState from '../framework/enum/ConversationState';

export default function checkConversationState(session){
    let customerConversationId = session.message.address.channelId + '/' + session.message.address.conversation.id;
    let conversation = queue.get(customerConversationId);

    return conversation.state === ConversationState.Bot;
}
