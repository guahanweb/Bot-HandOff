import * as builder from 'botbuilder';
import Handoff from './middleware/handoff';
import commandsMiddleware from './middleware/commands';

import entryDialogue from './dialogs/entry';

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
        this.SetBotMiddleware(this.bot, this.handoff);
        this.SetBotDialog(this.bot, this.dialog);
    }

    private InitializeLuis(model){
        var recognizer = new builder.LuisRecognizer(model);
        return new builder.IntentDialog({ recognizers: [recognizer] });
    }

    private SetBotMiddleware(bot, handoff){
        bot.use(
            //commandsMiddleware(handoff),
            //handoff.routingMiddleware(),
            /* other bot middlware should probably go here */
        );
    }

    private SetBotDialog(bot, dialog){
        bot.dialog('/', dialog);

        entryDialogue(dialog);
        dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand."));
    }

    public getConnector(){
        return this.connector;
    }

    public getBot(){
        return this.bot;
    }
}

