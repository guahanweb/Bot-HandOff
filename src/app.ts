import * as express from 'express';
import BotHandler from './bot';
import queue from './lib/queue';
import config from './config/';
import MutableConfig from "./config/mutable_config";
const app = express();

const bot = new BotHandler(config('master'));
const server = config('server');


// Setup Express Server
app.listen(server.port, server.host, () => {
    console.log('Server running at', server.host+server.port);
});

app.get('/pending', (req, res) => {
    res.send({
        customers: queue.getPendingCustomers()
    });
});

app.get('/configs', (req, res) => {
    let cfg = MutableConfig.getInstance() as Object
    console.log("received config change: " + req.query);
    Object.assign(cfg, req.query)
    res.send({
        "config" : cfg
    });
});

app.get('/conversations', (req, res) => {
    res.send({
        conversations: queue.getAllConversations()
    });
});

app.post('/api/messages', bot.getConnector().listen());

// Create endpoint for agent / call center
app.use('/webchat', express.static('public'));




