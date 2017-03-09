import config from '../config/';
import logDialog from '../utils/logDialog';

export default function accountDialog(dialog){
    dialog.matches('Greeting', [
        function(session, args, next) {
            var botRes = 'Hello there! How may I help you?';
            session.send(botRes);
        }
    ]);
}
