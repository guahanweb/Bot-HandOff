import Promise = require('bluebird');
import queue from '../lib/queue';

export default function (session, args, next) {
    let question = session.message.text;
    askAgent(session, question)
        .then((answer) => {
            session.send(answer);
        }, (err) => {
            session.send(err);
        });
    // session.send('Echo ' + session.message.text);
}

function askAgent(session, question: string) {
    return new Promise((resolve, reject) => {
        let customerConversationId = session.message.address.channelId + '/' + session.message.address.conversation.id;
        let conversation = queue.get(customerConversationId);

        if (conversation.agentConversationId !== null) {
            // send to agent
            
        } else {
            // agent will get queued text
        }
    });
}