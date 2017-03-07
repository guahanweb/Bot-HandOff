import * as express from 'express';
import BotHandler from './bot';
import queue from './lib/queue';

const app = express();
const bot = new BotHandler();

// Setup Express Server
app.listen(process.env.port || process.env.PORT || 3978, '::', () => {
    console.log('Server Up');
});

app.get('/pending', (req, res) => {
    res.send(queue.getPendingCustomers());
});

app.post('/api/messages', bot.getConnector().listen());

// Create endpoint for agent / call center
app.use('/webchat', express.static('public'));




