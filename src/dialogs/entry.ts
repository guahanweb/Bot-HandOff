export default function entryDialogue(dialog){
    dialog.matches('Issue', [
        function(session, args, next) {
            session.send('Echo ' + session.message.text);
        }
    ]);
}
