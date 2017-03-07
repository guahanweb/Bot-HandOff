import * as express from 'express';
import BotHandler from './bot';
import config from './config/';

const app = express();
const bot = new BotHandler(config('master'));

const server = config('server');

// Setup Express Server
app.listen(server.port, server.host, () => {
    console.log('Server running at', server.host+server.port);
});

app.post('/api/messages', bot.getConnector().listen());

// Create endpoint for agent / call center
app.use('/webchat', express.static('public'));




