import * as builder from 'botbuilder';
import Handoff from './middleware/handoff';
import message from './lib/messages';
import commandsMiddleware from './middleware/commands';

import askAgent from './utils/askAgent';

import accountDialog from './dialogs/account';
import fantasyDialog from './dialogs/fantasy';
import greetingDialog from './dialogs/greeting';
import ConversationState from './framework/enum/ConversationState';

import Promise = require('bluebird');

import queue from './lib/queue';
import checkState from './utils/checkCustomerState';
import logDialog from './utils/logDialog';

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

        this.isAgent = (session: builder.Session) => session.privateConversationData.isAgent === true;
        
        this.handoff = new Handoff(this.bot, this.isAgent);
        
        this.dialog = this.InitializeLuis(config.luis);
        this.SetBotMiddleware();
        this.SetBotDialog();

        this.bot.on('event', (ev) => {
            if (ev.name === 'connect_agent') {
                this.bot.loadSession(ev.address, (err, session: builder.Session) => {
                    if (session) {
                        session.privateConversationData.isAgent = true;
                        session.save();
                    }
                });
                let agentAddress = ev.address.channelId + '/' + ev.address.conversation.id;
                let customerAddress = ev.value.customerConversationId;
                queue.update(customerAddress, agentAddress, ev.address);

                var allMsgs: builder.IMessage[] = queue.get(customerAddress).messages.map((item) => {
                    return item.address(ev.address).toMessage();
                });
                
                this.bot.send(allMsgs);
                queue.setState(customerAddress, ConversationState.Agent);
            }
        });
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
                session.replaceDialog('/customer');
            }
        });
    }

    private SetCustomerDialogs(){
        this.bot.dialog('/customer', this.dialog);

        accountDialog(this.bot, this.dialog);
        fantasyDialog(this.bot, this.dialog);
        greetingDialog(this.dialog);

        var bot = this.bot;
        this.dialog.onDefault(function(session, args, next){
            var txt = '[BOT] no suggestions available';
            var msg = new builder.Message().text(txt);

            if(checkState(session)){
                askAgent(bot, session, msg).then(response => {
                    session.send(response);
                }).catch(err => {
                    session.send(err);
                });
            } else {
                logDialog(session, txt);
            }
        });

    }

    public getConnector(){
        return this.connector;
    }

    public getBot(){
        return this.bot;
    }
}


