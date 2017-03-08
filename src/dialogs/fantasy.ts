import config from '../config/';
import checkQNA from '../utils/checkQNA';

const fantasy = config('QnA').fantasy;

export default function fantasyDialog(dialog){
    dialog.matches('Fantasy Support', [
        function(session, args, next) {
            checkQNA(account, session.message.text, session).then(function(cardFunc){
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
