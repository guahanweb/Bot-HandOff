import * as builder from 'botbuilder';

import config from '../config/';

import checkQNA from '../utils/checkQNA';
import checkQNA_BOT from '../utils/checkQNA_BOT';

import askAgent from '../utils/askAgent';
import checkState from '../utils/checkCustomerState';

import logDialog from '../utils/logDialog';

const watch = config('QnA').watchespn;

export default function watchDialog(bot, dialog){
    dialog.matches('WatchESPN Support', [
        function(session, args, next) {
            if(checkState(session)){
                checkQNA_BOT(watch, session.message.text, session).then(msg => {
                    let msg_object = new builder.Message().text(msg);
                    session.sendTyping();
                    logDialog(session, msg);
                    session.send(msg_object);
                }).catch(err => {
                    session.send(err);
                });
            } else {
                checkQNA(watch, session.message.text, session).then(function(cardFunc){
                    askAgent(bot, session, cardFunc).then(response => {
                        session.send(response);
                    }).catch(err => {
                        session.send(err);
                    });
                }).catch(err => {
                    session.send(err);
                });
            }
        }
    ]);
}


