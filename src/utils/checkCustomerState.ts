import queue from '../lib/queue';
import ConversationState from '../framework/enum/ConversationState';
import MutableConfig from '../config/MutableConfig'

export default function checkConversationState(session){
    let customerConversationId = session.message.address.channelId + '/' + session.message.address.conversation.id;
    let conversation = queue.get(customerConversationId);

    let config = MutableConfig.getInstance() as any;
    //console.log(config['BOT']);
    if(conversation.state === ConversationState.Agent){
        return false;
    } else {
        if(config['BOT'] !== undefined){
            return config['BOT'];
        } else {
            //if(conversation.state === ConversationState.Bot){
            //    return true;
            //} else {
                return false;
            //}
        }
    }
}
