import config from '../config/';
import checkQNA from '../utils/checkQNA';
import askAgent from '../utils/askAgent';

const account = config('QnA').account;

export default function accountDialog(bot, dialog){
    dialog.matches('Account Support', [
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
