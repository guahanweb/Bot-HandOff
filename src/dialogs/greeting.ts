import config from '../config/';
import logDialog from '../utils/logDialog'; 
import checkState from '../utils/checkCustomerState';

export default function accountDialog(dialog){
    dialog.matches('Greeting', [
        function(session, args, next) {
            if(checkState(session)){
                var botRes = 'Hello there! How may I help you?';
                logDialog(session, botRes);
                session.send(botRes);
            }
        }
    ]);
}
