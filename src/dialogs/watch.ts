import config from '../config/';
import checkQNA from '../utils/checkQNA';
import askAgent from '../utils/askAgent';
import checkState from '../utils/checkCustomerState';

const watch = config('QnA').watchespn;

export default function fantasyDialog(bot, dialog){
    dialog.matches('WatchESPN Support', [
        function(session, args, next) {
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
    ]);
}
