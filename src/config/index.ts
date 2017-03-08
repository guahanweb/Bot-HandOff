const luis_api = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/';
const luis_sub = '?subscription-key=';

const qna_api = 'https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/{QNA_ID}/generateAnswer';

const config = {
    server : {
        host: process.env.HOST || process.env.host || '::',
        port: process.env.PORT || process.env.port || '3978'
    },

    master : {
        app_id: process.env.MICROSOFT_APP_ID || '???',
        app_pw: process.env.MICROSOFT_APP_PASSWORD || '???'
        luis : {
            app_id: '???',
            sub_key: '???',
            url: process.env.LUIS_URL,
        }
    },

    QnA : {
        account : {
            id : '???',
            key : '???',
        },

        fantasy : {
            id : '???',
            key : '???',
        }
    }
}

export default function configuration(key){
    var obj = Object.assign({}, config[key]);

    if(obj.luis){
        obj.luis = build_luis_api(obj.luis.app_id, obj.luis.sub_key, obj.luis.url);
    }

    if(key === 'QnA'){
        Object.keys(obj).forEach(key => {
            obj[key].url = build_qna_api(obj[key]);
        });
    }

    return obj;
}


function build_qna_api(obj){
    return qna_api.replace('{QNA_ID}', obj.id);
}

function build_luis_api(app_id, sub_key, URL){
    return URL || (luis_api + app_id + luis_sub + sub_key);
}

