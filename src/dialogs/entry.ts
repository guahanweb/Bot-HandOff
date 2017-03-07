import message from '../lib/messages';

export default function (session, args, next) {
    message.send({
        sender: 'me',
        recipient: 'you',
        message: session.message.text
    });
    // session.send('Echo ' + session.message.text);
}
