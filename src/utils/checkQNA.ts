import * as builder from 'botbuilder';

import Promise = require('bluebird');
import request = require('request');
import _ = require('lodash');

export default function make_request(knowledge_bank, message, session){
    return new Promise((resolve, reject) => {
        request({
            method : 'POST',
            uri : knowledge_bank.url,
            headers : {
                'Content-Type' : 'application/json',
                'Ocp-Apim-Subscription-Key' : knowledge_bank.key
            },
            body : JSON.stringify({
                'question' : message,
                'top' : 3
            })
        }, function(err, res, body){
            if(err){
                reject(err);
            }

            if(res.statusCode === 200){
                var data = JSON.parse(body);
                resolve(createCard(data));
            }
        });
    });
}

function createCard(data) {
    return function(session){
    var answers = data.answers.map(x => {
            return _.unescape(x.answer);
        }).map(x => {
        return new builder.HeroCard()
            .title('Possible Answer')
            .text(x)
            .buttons([
                builder.CardAction.imBack(null, x, 'Correct')
            ]);
        });

    return new builder.Message()
        .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(answers);
    }
}

