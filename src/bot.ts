import * as builder from 'botbuilder';
import dialogs from './dialogs/';
import Handoff from './middleware/handoff';
import message from './lib/messages';
import commandsMiddleware from './middleware/commands';

import Promise = require('bluebird');
import queue from './lib/queue';

export default class bot_handler {

    private bot;
    private connector;
    private handoff;
    private isAgent;

    constructor(){
        // Create chat bot
        this.connector = new builder.ChatConnector({
            appId: process.env.MICROSOFT_APP_ID,
            appPassword: process.env.MICROSOFT_APP_PASSWORD
        });

        this.bot = new builder.UniversalBot(this.connector);

        // replace this function with custom login/verification for agents
        this.isAgent = (session: builder.Session) =>
            session.message.user.name.startsWith("Agent");
        
        this.handoff = new Handoff(this.bot, this.isAgent);

        this.SetBotMiddleware();
        this.SetBotDialog();
    }

    private SetBotMiddleware(){
        this.bot.use(
            // commandsMiddleware(this.handoff),
            this.handoff.routingMiddleware()
            /* other bot middlware should probably go here */
        );
    }

    private SetBotDialog(){
        let bot = this.bot;
        this.bot.dialog('/', (session, args, next) => {
            let suggestion = 'BOT WRAPPER: ' + session.message.text;
            askAgent(bot, session, suggestion)
                .then((answer) => {
                    session.send(answer);
                }, (err) => {
                    session.send(err);
                });
            // session.send('Echo ' + session.message.text);
        });
    }

    public getConnector(){
        return this.connector;
    }
}

/**
 * Specific pre-built suggestion cards that need to be sent to the agent for response.
 * Additionally, these cards will be queued up in case we don't yet have an agent connected.
 * 
 * @param bot
 * @param session 
 * @param suggestion The card or suggested response for the agent to approve/deny
 */
function askAgent(bot: builder.UniversalBot, session, suggestion: string) {
    return new Promise((resolve, reject) => {
        let customerConversationId = session.message.address.channelId + '/' + session.message.address.conversation.id;
        let conversation = queue.get(customerConversationId);

        queue.add(customerConversationId, suggestion); // add to this customer queue
        queue.await(customerConversationId, resolve, reject); // update the pending promise for resolution

        if (conversation.agentAddress !== null) {
            // send to agent
            bot.send(
                new builder.Message()
                    .address(conversation.agentAddress)
                    .text(suggestion)
            );
        }
        
        // agent will get queued text whenever they connect
    });
}