import config from '../config/';
import checkQNA from '../utils/checkQNA';
import askAgent from '../utils/askAgent';
import checkState from '../utils/checkCustomerState';

const fantasy = config('QnA').fantasy;

export default function fantasyDialog(bot, dialog){
    dialog.matches('Fantasy Support', [
        function(session, args, next) {
            checkQNA(fantasy, session.message.text, session).then(function(cardFunc){
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
