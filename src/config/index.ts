
const luis_api = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/';
const luis_sub = '?subscription-key=';

const config = {
    server : {
        host: process.env.HOST || process.env.host || '::',
        port: process.env.PORT || process.env.port || '3978'
    },

    master : {
        app_id: process.env.MICROSOFT_APP_ID || '???',
        app_pw: process.env.MICROSOFT_APP_PASSWORD || '???',
        luis : {
            app_id: '???',
            sub_key: '???'
        }
    }

}

export default function configuration(key){
    var obj = Object.assign({}, config[key]);

    if(obj.luis){
        obj.luis = build_luis_api(obj.luis.app_id, obj.luis.sub_key);
    }
    
    return obj;
}

function build_luis_api(app_id, sub_key){
    return luis_api + app_id + luis_sub + sub_key;
}
