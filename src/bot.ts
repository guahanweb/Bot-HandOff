import * as builder from 'botbuilder';
import Handoff from './middleware/handoff';
import message from './lib/messages';
import commandsMiddleware from './middleware/commands';

import askAgent from './utils/askAgent';
import accountDialog from './dialogs/account';
import fantasyDialog from './dialogs/fantasy';

import Promise = require('bluebird');

import queue from './lib/queue';

export default class bot_handler {

    private bot;
    private connector;
    private handoff;
    private isAgent;

    private dialog;

    constructor(config){
        // Create chat bot
        this.connector = new builder.ChatConnector({
            appId: config.app_id, 
            appPassword: config.app_pw
        });

        this.bot = new builder.UniversalBot(this.connector);

        // replace this function with custom login/verification for agents
        this.isAgent = (session: builder.Session) =>
            session.message.user.name.startsWith("Agent");
        
        this.handoff = new Handoff(this.bot, this.isAgent);
        
        this.dialog = this.InitializeLuis(config.luis);
        this.SetBotMiddleware();
        this.SetBotDialog();
    }

    private InitializeLuis(model){
        var recognizer = new builder.LuisRecognizer(model);
        return new builder.IntentDialog({ recognizers: [recognizer] });
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
        this.SetCustomerDialogs();

        this.bot.dialog('/', (session, args, next) => {
            if (this.isAgent(session)) {
                let agentConversationId = session.message.address.channelId + '/' + session.message.address.conversation.id;
                let customer = queue.getCustomerByAgent(agentConversationId);
                bot.send(
                    new builder.Message()
                        .address(customer.customerAddress)
                        .text(session.message.text)
                )
            } else {
                session.beginDialog('/customer');
            }
        });
    }

    private SetCustomerDialogs(){
        this.bot.dialog('/customer', this.dialog);

        accountDialog(this.bot, this.dialog);
        fantasyDialog(this.bot, this.dialog);

        var bot = this.bot;
        this.dialog.onDefault(function(session, args, next){
            var msg = session.message.text;
            askAgent(bot, session, function(session){return new builder.Message(session).text(msg);}).then(response => {
                session.send(response);
            }).catch(err => {
                session.send(err);
            });
        });

    }

    public getConnector(){
        return this.connector;
    }

    public getBot(){
        return this.bot;
    }
}


